import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTransport } from './transport'
import type { Engine } from './engine'
import type { StrudelPattern } from './types'

const deferred = <T,>() => {
    let resolve!: (value: T) => void
    let reject!: (cause: unknown) => void
    const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
    return { promise, resolve, reject }
}

describe('shared transport lifecycle', () => {
    let engine: Engine
    let createEngine: ReturnType<typeof vi.fn<() => Promise<Engine>>>
    let unlockAudio: ReturnType<typeof vi.fn<() => Promise<void>>>
    let transport: ReturnType<typeof createTransport>

    beforeEach(() => {
        engine = { prepare: vi.fn(async () => {}), start: vi.fn(async () => {}), stop: vi.fn() }
        createEngine = vi.fn(async () => engine)
        unlockAudio = vi.fn(async () => {})
        transport = createTransport({ createEngine, unlockAudio })
    })

    it('waits for initialization and unlocks audio in the original call', async () => {
        const initialization = deferred<Engine>()
        createEngine.mockReturnValueOnce(initialization.promise)
        transport.subscribe(vi.fn())
        const playing = transport.play('pattern')
        expect(unlockAudio).toHaveBeenCalledOnce()
        expect(engine.prepare).not.toHaveBeenCalled()
        initialization.resolve(engine)
        await playing
        expect(createEngine).toHaveBeenCalledOnce()
        expect(engine.prepare).toHaveBeenCalledWith('pattern')
        expect(transport.getSnapshot()).toEqual({ status: 'playing', error: null })
    })

    it('reports initialization failure and permits a later Play retry', async () => {
        const cause = new Error('Web Audio unavailable')
        createEngine.mockRejectedValueOnce(cause)
        transport.subscribe(vi.fn())
        await transport.play('pattern')
        expect(transport.getSnapshot()).toMatchObject({ status: 'error', error: { code: 'initialization', cause } })
        await transport.play('retry')
        expect(createEngine).toHaveBeenCalledTimes(2)
        expect(transport.getSnapshot().status).toBe('playing')
    })

    it('reports initialization failure without requiring Play', async () => {
        createEngine.mockRejectedValueOnce(new Error('init failed'))
        transport.subscribe(vi.fn())
        await vi.waitFor(() => expect(transport.getSnapshot().status).toBe('error'))
        expect(transport.getSnapshot().error?.code).toBe('initialization')
        expect(engine.prepare).not.toHaveBeenCalled()
    })

    it('reports audio permission failure without evaluating or starting', async () => {
        const cause = new Error('audio blocked')
        unlockAudio.mockRejectedValueOnce(cause)
        transport.subscribe(vi.fn())
        await transport.play('pattern')
        expect(transport.getSnapshot()).toMatchObject({ status: 'error', error: { code: 'transport', cause } })
        expect(engine.prepare).not.toHaveBeenCalled()
        expect(engine.start).not.toHaveBeenCalled()
    })

    it('clears an evaluation error on Stop and allows repeated Stop', async () => {
        const cause = new Error('bad pattern')
        vi.mocked(engine.prepare).mockRejectedValueOnce(cause)
        transport.subscribe(vi.fn())
        await transport.play('bad code')
        expect(transport.getSnapshot()).toMatchObject({ status: 'error', error: { code: 'evaluation', cause } })
        transport.stop()
        transport.stop()
        expect(transport.getSnapshot()).toEqual({ status: 'idle', error: null })
    })

    it('reports native pattern and scheduler startup failures as transport errors', async () => {
        const native: StrudelPattern = { play: () => native }
        transport.subscribe(vi.fn())
        vi.mocked(engine.prepare).mockRejectedValueOnce(new Error('bad native pattern'))
        await transport.play(native)
        expect(transport.getSnapshot().error?.code).toBe('transport')
        vi.mocked(engine.start).mockRejectedValueOnce(new Error('start failed'))
        await transport.play('pattern')
        expect(transport.getSnapshot()).toMatchObject({ status: 'error', error: { code: 'transport', message: 'start failed' } })
    })

    it('stops old playback before preparing a replacement', async () => {
        transport.subscribe(vi.fn())
        await transport.play('first')
        vi.mocked(engine.stop).mockClear()
        vi.mocked(engine.prepare).mockImplementationOnce(async () => {
            expect(engine.stop).toHaveBeenCalledOnce()
        })
        await transport.play('second')
        expect(transport.getSnapshot().status).toBe('playing')
    })

    it('serializes pending evaluation and only starts the latest Play', async () => {
        const preparation = deferred<void>()
        vi.mocked(engine.prepare).mockReturnValueOnce(preparation.promise)
        transport.subscribe(vi.fn())
        const first = transport.play('first')
        await vi.waitFor(() => expect(engine.prepare).toHaveBeenCalledWith('first'))
        const second = transport.play('second')
        const latest = transport.play('latest')
        expect(engine.prepare).toHaveBeenCalledTimes(1)
        preparation.resolve()
        await Promise.all([first, second, latest])
        expect(vi.mocked(engine.prepare).mock.calls.map(([input]) => input)).toEqual(['first', 'latest'])
        expect(engine.start).toHaveBeenCalledOnce()
        expect(transport.getSnapshot().status).toBe('playing')
    })

    it('cancels Play while initialization is pending', async () => {
        const initialization = deferred<Engine>()
        createEngine.mockReturnValueOnce(initialization.promise)
        transport.subscribe(vi.fn())
        const playing = transport.play('pattern')
        transport.stop()
        initialization.resolve(engine)
        await playing
        expect(engine.prepare).not.toHaveBeenCalled()
        expect(transport.getSnapshot().status).toBe('idle')
    })

    it('keeps Stop effective when an evaluation finishes later', async () => {
        const preparation = deferred<void>()
        vi.mocked(engine.prepare).mockReturnValueOnce(preparation.promise)
        transport.subscribe(vi.fn())
        const playing = transport.play('pattern')
        await vi.waitFor(() => expect(engine.prepare).toHaveBeenCalledOnce())
        transport.stop()
        preparation.resolve()
        await playing
        expect(engine.start).not.toHaveBeenCalled()
        expect(transport.getSnapshot().status).toBe('idle')
    })

    it('allows a fresh Play when a cancelled audio resume never settles', async () => {
        const blocked = deferred<void>()
        unlockAudio.mockReturnValueOnce(blocked.promise)
        transport.subscribe(vi.fn())
        const old = transport.play('blocked')
        transport.stop()
        await old
        await transport.play('fresh gesture')
        expect(engine.prepare).toHaveBeenCalledExactlyOnceWith('fresh gesture')
        expect(transport.getSnapshot().status).toBe('playing')
    })

    it('stops a scheduler whose asynchronous start finishes after Stop', async () => {
        const starting = deferred<void>()
        let running = false
        vi.mocked(engine.start).mockImplementationOnce(async () => {
            await starting.promise
            running = true
        })
        vi.mocked(engine.stop).mockImplementation(() => { running = false })
        transport.subscribe(vi.fn())
        const playing = transport.play('pattern')
        await vi.waitFor(() => expect(engine.start).toHaveBeenCalledOnce())
        transport.stop()
        starting.resolve()
        await playing
        expect(running).toBe(false)
        expect(transport.getSnapshot().status).toBe('idle')
    })

    it('ignores stale evaluation failure and runs the latest request', async () => {
        const preparation = deferred<void>()
        vi.mocked(engine.prepare).mockReturnValueOnce(preparation.promise)
        transport.subscribe(vi.fn())
        const old = transport.play('old')
        await vi.waitFor(() => expect(engine.prepare).toHaveBeenCalledOnce())
        const latest = transport.play('latest')
        preparation.reject(new Error('old error'))
        await Promise.all([old, latest])
        expect(engine.start).toHaveBeenCalledOnce()
        expect(transport.getSnapshot()).toEqual({ status: 'playing', error: null })
    })

    it('only stops on the last unsubscribe and invalidates pending playback', async () => {
        const preparation = deferred<void>()
        vi.mocked(engine.prepare).mockReturnValueOnce(preparation.promise)
        const removeFirst = transport.subscribe(vi.fn())
        const removeLast = transport.subscribe(vi.fn())
        const playing = transport.play('pattern')
        await vi.waitFor(() => expect(engine.prepare).toHaveBeenCalledOnce())
        vi.mocked(engine.stop).mockClear()
        removeFirst()
        expect(engine.stop).not.toHaveBeenCalled()
        removeLast()
        expect(engine.stop).toHaveBeenCalledOnce()
        preparation.resolve()
        await playing
        expect(engine.start).not.toHaveBeenCalled()
        expect(transport.getSnapshot().status).toBe('idle')
    })

    it('turns Stop failures into state errors without throwing', async () => {
        transport.subscribe(vi.fn())
        await transport.play('pattern')
        vi.mocked(engine.stop).mockImplementationOnce(() => { throw new Error('stop failed') })
        expect(() => transport.stop()).not.toThrow()
        expect(transport.getSnapshot()).toMatchObject({ status: 'error', error: { code: 'transport', message: 'stop failed' } })
    })
})
