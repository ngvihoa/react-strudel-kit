import { vi } from 'vitest'
import type { StrudelRepl } from '@strudel/web'

/** Models the small @strudel/web 1.3.0 boundary owned by this integration. */
export const createMockWeb = () => {
    const state: { evalError?: unknown } = {}
    const evaluate = vi.fn<StrudelRepl['evaluate']>(async () => {
        state.evalError = undefined
        return {}
    })
    const setPattern = vi.fn<StrudelRepl['setPattern']>(async () => ({}))
    const start = vi.fn(async () => {})
    const hush = vi.fn()
    const repl = { evaluate, setPattern, start, stop: hush, state }
    const audioContext = { state: 'running', resume: vi.fn(async () => {}) }
    return {
        evaluate,
        hush,
        initStrudel: vi.fn(async () => repl),
        initAudio: vi.fn(async () => {}),
        getAudioContext: vi.fn(() => audioContext),
    }
}
