declare module '@strudel/web' {
    export function evaluate(code: string): Promise<unknown> | unknown
    export function hush(): void
    export function initStrudel(options?: { prebake?: () => unknown }): unknown
}