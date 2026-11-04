import { toStrudelCode } from './serializer.js'
import type { StrudelInput } from './types.js'

type Web = typeof import('@strudel/web')
let web: Web | undefined
let loading: Promise<Web> | undefined
let gestureContext: AudioContext | undefined

const loadWeb = (): Promise<Web> => {
    loading ??= import('@strudel/web').then((module) => {
        // A first Play can arrive before the runtime chunk. Reuse the context
        // resumed in that gesture before Strudel constructs its scheduler.
        if (gestureContext) module.setAudioContext(gestureContext)
        web = module
        return module
    }).catch((cause) => {
        loading = undefined
        throw cause
    })
    return loading
}

/** The version-specific Strudel boundary used by the shared transport. */
export type Engine = {
    prepare: (input: StrudelInput) => Promise<void>
    start: () => Promise<void>
    stop: () => void
}

export const createEngine = async (): Promise<Engine> => {
    const { initStrudel } = await loadWeb()
    const repl = await initStrudel()

    return {
        prepare: async (input) => {
            if (input !== null && typeof input === 'object' && 'play' in input) {
                // Native .play() does not expose its asynchronous completion.
                await repl.setPattern(input, false)
            } else {
                await repl.evaluate(toStrudelCode(input), false)
                // Strudel reports most evaluation failures through state.
                if (repl.state.evalError !== undefined) {
                    throw repl.state.evalError
                }
            }
        },
        start: () => repl.start(),
        stop: () => repl.stop(),
    }
}

/** Invoke from play() before awaiting initialization, preserving user activation. */
export const unlockAudio = async () => {
    // resume() must run before any import/await to preserve browser activation.
    const context = web ? web.getAudioContext() : (gestureContext ??= new AudioContext())
    await context.resume()
    const { initAudio } = await loadWeb()
    await initAudio()
    if (context.state !== 'running') {
        throw new Error('Browser audio is unavailable. Try Play again from a user gesture.')
    }
}
