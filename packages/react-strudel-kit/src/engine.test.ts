import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAudioContext, initAudio, initStrudel } from '@strudel/web'
import { createEngine, unlockAudio } from './engine'
import { fn, mini } from './index'
import type { StrudelPattern } from './types'

vi.mock('@strudel/web', async () => {
    const { createMockWeb } = await import('../test/mockWeb')
    return createMockWeb()
})

describe('Strudel 1.3.0 adapter', () => {
    beforeEach(() => vi.clearAllMocks())

    it('prepares typed code without autoplay and starts only explicitly', async () => {
        const engine = await createEngine()
        const repl = await vi.mocked(initStrudel).mock.results[0].value
        await engine.prepare(fn('sample', mini('bd')))
        expect(repl.evaluate).toHaveBeenCalledWith('s("bd")', false)
        expect(repl.start).not.toHaveBeenCalled()
        await engine.start()
        expect(repl.start).toHaveBeenCalledOnce()
        engine.stop()
        expect(repl.stop).toHaveBeenCalledOnce()
    })

    it('rejects an evaluation error recorded in state even if evaluate resolves', async () => {
        const engine = await createEngine()
        const repl = await vi.mocked(initStrudel).mock.results[0].value
        const cause = new Error('invalid syntax')
        vi.mocked(repl.evaluate).mockImplementationOnce(async () => {
            repl.state.evalError = cause
            return undefined
        })
        await expect(engine.prepare('bad code')).rejects.toBe(cause)
        await expect(engine.prepare('note("c3")')).resolves.toBeUndefined()
        expect(repl.state.evalError).toBeUndefined()
    })

    it('sets a native pattern without invoking its fire-and-forget play method', async () => {
        const engine = await createEngine()
        const repl = await vi.mocked(initStrudel).mock.results[0].value
        const native: StrudelPattern = { play: vi.fn(() => native) }
        await engine.prepare(native)
        expect(repl.setPattern).toHaveBeenCalledWith(native, false)
        expect(native.play).not.toHaveBeenCalled()
        expect(repl.evaluate).not.toHaveBeenCalled()
    })

    it('resumes audio immediately and awaits audio setup', async () => {
        const context = getAudioContext()
        const unlocking = unlockAudio()
        expect(context.resume).toHaveBeenCalledOnce()
        await unlocking
        expect(initAudio).toHaveBeenCalledOnce()
    })

    it('rejects browser resume failures', async () => {
        const cause = new Error('permission denied')
        vi.mocked(getAudioContext().resume).mockRejectedValueOnce(cause)
        await expect(unlockAudio()).rejects.toBe(cause)
        expect(initAudio).not.toHaveBeenCalled()
    })

    it('rejects audio initialization failures', async () => {
        vi.mocked(initAudio).mockRejectedValueOnce(new Error('audio setup failed'))
        await expect(unlockAudio()).rejects.toThrow('audio setup failed')
    })

    it('does not report audio readiness if the context remains suspended', async () => {
        vi.mocked(getAudioContext).mockReturnValueOnce({
            state: 'suspended', resume: vi.fn(async () => {}),
        } as unknown as AudioContext)
        await expect(unlockAudio()).rejects.toThrow('Browser audio is unavailable')
    })
})
