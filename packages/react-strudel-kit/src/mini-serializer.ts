import type { MiniNode } from './mini-ast'

// Sequences contain slices; stack/choice/polymeter lanes contain sequences.
// Operators need their own slice so nested weights and modifiers stay scoped.
type Context = 'root' | 'slice' | 'lane' | 'operand'

const serialize = (value: MiniNode, context: Context): string => {
    const code = serializeNode(value)
    const grouped = value.kind === 'raw'
        || value.kind === 'stack'
        || value.kind === 'choice'
        || (value.kind === 'sequence' && context !== 'lane')
        || (context === 'operand' && ['repeat', 'speed', 'weight', 'degrade'].includes(value.kind))

    return context !== 'root' && grouped ? `[${code}]` : code
}

const serializeNode = (value: MiniNode): string => {
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
            return value.items.map((item) => serialize(item, 'slice')).join(' ')
        case 'stack':
            return value.items.map((item) => serialize(item, 'lane')).join(', ')
        case 'choice':
            return value.items.map((item) => serialize(item, 'lane')).join(' | ')
        case 'subcycle':
            return `[${serialize(value.value, 'root')}]`
        case 'polymeter':
            return `{${value.items.map((item) => serialize(item, 'lane')).join(', ')}}`
        case 'repeat':
            return `${serialize(value.value, 'operand')}*${value.times}`
        case 'speed':
            return `${serialize(value.value, 'operand')}${value.direction === 'fast' ? '*' : '/'}${value.factor}`
        case 'weight':
            return `${serialize(value.value, 'operand')}@${value.amount}`
        case 'degrade':
            return `${serialize(value.value, 'operand')}${value.probability === undefined ? '?' : `?${value.probability}`}`
    }
}

/**
 * Converts a typed AST into Mini-Notation, preserving nested timing and scope.
 *
 * @example
 * ```ts
 * toMiniNotation(fast(sequence(sample('bd'), sample('sd')), 2))
 * // '[bd sd]*2'
 * ```
 */
export const toMiniNotation = (value: MiniNode): string => serialize(value, 'root')
