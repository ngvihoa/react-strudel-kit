import { getAudioContext, initAudio, initStrudel } from '@strudel/web'
import { toStrudelCode } from './serializer'
import type { StrudelInput } from './types'

/** The version-specific Strudel boundary used by the shared transport. */
export type Engine = {
    prepare: (input: StrudelInput) => Promise<void>
    start: () => Promise<void>
    stop: () => void
}

export const createEngine = async (): Promise<Engine> => {
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
    const context = getAudioContext()
    await context.resume()
    await initAudio()
    if (context.state !== 'running') {
        throw new Error('Browser audio is unavailable. Try Play again from a user gesture.')
    }
}
