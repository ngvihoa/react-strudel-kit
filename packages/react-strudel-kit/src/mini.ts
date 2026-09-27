import { parse } from '@strudel/mini/krill-parser.js'
import type { MiniNotation } from './types'

const toParserInput = (value: string): string => JSON.stringify(value)

/**
 * Checks whether a string is valid Strudel Mini-Notation.
 *
 * @param value The unquoted Mini-Notation source to validate.
 * @returns `true` when Strudel's parser accepts the value.
 *
 * @example
 * ```ts
 * isMiniNotation('bd*4') // true
 * isMiniNotation('[bd sd') // false
 * ```
 */
export const isMiniNotation = (value: string): value is MiniNotation => {
    try {
        parse(toParserInput(value))
        return true
    } catch {
        return false
    }
}

/**
 * Validates and brands a Mini-Notation string.
 *
 * @param value The unquoted Mini-Notation source to validate.
 * @returns The same value branded as `MiniNotation`.
 * @throws {Error} When Strudel's Mini-Notation parser rejects the value.
 *
 * @example
 * ```ts
 * const rhythm = mini('bd*4')
 * // rhythm has type MiniNotation
 * ```
 */
export const mini = (value: string): MiniNotation => {
    if (!isMiniNotation(value)) {
        throw new Error(`Invalid Strudel Mini-Notation: ${value}`)
    }

    return value
}

/**
 * Asserts that a string is valid Mini-Notation without returning a new value.
 *
 * @param value The string to validate.
 * @throws {Error} When Strudel's Mini-Notation parser rejects the value.
 *
 * @example
 * ```ts
 * let value = getUserInput()
 * assertMiniNotation(value)
 * // value is narrowed to MiniNotation here
 * ```
 */
export function assertMiniNotation(value: string): asserts value is MiniNotation {
    mini(value)
}