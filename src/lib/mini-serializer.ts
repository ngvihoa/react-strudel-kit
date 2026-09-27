import type { MiniNode } from './mini-ast'

/**
 * Converts a typed Mini-Notation AST into a Strudel Mini-Notation string.
 *
 * @param value The typed Mini-Notation node to serialize.
 * @returns A Mini-Notation string accepted by Strudel.
 *
 * @example
 * ```ts
 * toMiniNotation(sequence(
 *   repeat(sample('bd'), 4),
 *   rest(),
 *   sample('sd'),
 * ))
 * // 'bd*4 ~ sd'
 * ```
 */
export const toMiniNotation = (value: MiniNode): string => {
    switch (value.kind) {
        case 'sample':
        case 'pitch':
        case 'raw':
            return value.value
        case 'number':
            return String(value.value)
        case 'rest':
            return '~'
        case 'sequence':
            return value.items.map(toMiniNotation).join(' ')
        case 'stack':
            return value.items.map(toMiniNotation).join(', ')
        case 'choice':
            return value.items.map(toMiniNotation).join(' | ')
        case 'subcycle':
            return `[${toMiniNotation(value.value)}]`
        case 'polymeter':
            return `{${value.items.map(toMiniNotation).join(', ')}}`
        case 'repeat':
            return `${toMiniNotation(value.value)}*${value.times}`
        case 'speed':
            return `${toMiniNotation(value.value)}${value.direction === 'fast' ? '*' : '/'}${value.factor}`
        case 'weight':
            return `${toMiniNotation(value.value)}@${value.amount}`
        case 'degrade':
            return `${toMiniNotation(value.value)}${value.probability === undefined ? '?' : `?${value.probability}`}`
    }
}
