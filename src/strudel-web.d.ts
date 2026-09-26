declare module '@strudel/web' {
    export class Pattern {
        play(): Pattern
    }

    export function evaluate(code: string, autoplay?: boolean): Promise<unknown>

    export function hush(): void

    export function initStrudel(options?: {
        miniAllStrings?: boolean
        prebake?: () => unknown | Promise<unknown>
        [key: string]: unknown
    }): Promise<unknown>
}