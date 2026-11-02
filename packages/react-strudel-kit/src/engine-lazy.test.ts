import { expect, it, vi } from 'vitest'
import { createEngine, unlockAudio } from './engine'

const { release, runtimeReady, context, setAudioContext, initStrudel } = vi.hoisted(() => {
    let release!: () => void
    const runtimeReady = new Promise<void>((resolve) => { release = resolve })
    return {
        release, runtimeReady,
        context: { state: 'running', resume: vi.fn(async () => {}) },
        setAudioContext: vi.fn(),
        initStrudel: vi.fn(async () => ({ evaluate: vi.fn(), setPattern: vi.fn(), start: vi.fn(), stop: vi.fn(), state: {} })),
    }
})

vi.mock('@strudel/web', async () => {
    await runtimeReady
    return { setAudioContext, initStrudel, getAudioContext: () => context, initAudio: vi.fn(async () => {}) }
})

it('resumes audio in the first gesture while the runtime is still downloading', async () => {
    vi.stubGlobal('AudioContext', vi.fn(function () { return context }))
    try {
        const preparing = createEngine()
        const unlocking = unlockAudio()
        expect(context.resume).toHaveBeenCalledOnce()
        expect(initStrudel).not.toHaveBeenCalled()

        release()
        await Promise.all([preparing, unlocking])
        expect(setAudioContext).toHaveBeenCalledExactlyOnceWith(context)
        expect(setAudioContext.mock.invocationCallOrder[0]).toBeLessThan(initStrudel.mock.invocationCallOrder[0])
    } finally {
        vi.unstubAllGlobals()
    }
})
