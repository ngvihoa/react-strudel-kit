declare module '@strudel/web' {
    export class Pattern {
        play(): Pattern
    }

    export function evaluate(code: string, autoplay?: boolean): Promise<unknown>

    export function hush(): void

    export type StrudelRepl = {
        evaluate: (code: string, autoplay?: boolean) => Promise<unknown>
        setPattern: (pattern: Pattern, autoplay?: boolean) => Promise<unknown>
        start: () => Promise<void>
        stop: () => void
        state: { evalError?: unknown }
    }

    export function getAudioContext(): AudioContext

    export function initAudio(): Promise<void>

    export function initStrudel(options?: {
        miniAllStrings?: boolean
        prebake?: () => unknown | Promise<unknown>
        [key: string]: unknown
    }): Promise<StrudelRepl>
}

declare module '@strudel/mini/krill-parser.js' {
    export function parse(code: string, options?: { startRule?: string }): unknown
}
