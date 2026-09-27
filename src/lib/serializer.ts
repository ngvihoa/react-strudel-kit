import type { PatternCallback, PatternExpression, PatternFactoryCall, PatternModifierCall, StrudelArgument, StrudelCodeInput } from './types'
import type { MiniNode } from './mini-ast'
import { toMiniNotation } from './mini-serializer'

/**
 * Checks whether an argument is a typed Mini-Notation AST node.
 *
 * @param argument The value to inspect.
 * @returns `true` when the value has a MiniNode discriminant.
 *
 * @example
 * ```ts
 * isMiniNode(sample('bd')) // true
 * isMiniNode({ root: { name: 's', args: ['bd'] } }) // false
 * ```
 */
const isMiniNode = (argument: StrudelArgument): argument is MiniNode => {
    return typeof argument === 'object' && argument !== null && !Array.isArray(argument) && 'kind' in argument
}

/**
 * Checks whether an argument is a nested typed pattern expression.
 *
 * @param argument The value to inspect.
 * @returns `true` when the value has the expression shape required by the serializer.
 *
 * @example
 * ```ts
 * isPatternExpression({ root: { name: 's', args: ['bd'] } }) // true
 * isPatternExpression(['bd']) // false
 * ```
 */
const isPatternExpression = (argument: StrudelArgument): argument is PatternExpression => {
    return typeof argument === 'object' && argument !== null && !Array.isArray(argument) && 'root' in argument
}

/**
 * Checks whether an argument is a typed callback expression.
 *
 * @param argument The value to inspect.
 * @returns `true` for a callback body and `false` for a pattern expression.
 *
 * @example
 * ```ts
 * isPatternCallback({ chain: [{ name: 'rev' }] }) // true
 * isPatternCallback({ root: { name: 's', args: ['bd'] } }) // false
 * ```
 */
const isPatternCallback = (argument: StrudelArgument): argument is PatternCallback => {
    return typeof argument === 'object' && argument !== null && !Array.isArray(argument) && 'chain' in argument && !('root' in argument)
}

/**
 * Converts one typed argument to a Strudel expression fragment.
 *
 * @param argument A primitive, nested expression, or array of arguments.
 * @returns A valid JavaScript fragment suitable for a Strudel call.
 * @throws {Error} If the argument has an unsupported runtime shape.
 *
 * @example
 * ```ts
 * serializeArgument('bd sd') // '"bd sd"'
 * serializeArgument(0.8) // '0.8'
 * serializeArgument(['left', 'right']) // '["left", "right"]'
 * ```
 */
const serializeArgument = (argument: StrudelArgument): string => {
    if (typeof argument === 'string') {
        return JSON.stringify(argument)
    }

    if (argument === null || typeof argument === 'number' || typeof argument === 'boolean') {
        return String(argument)
    }

    if (isMiniNode(argument)) {
        return JSON.stringify(toMiniNotation(argument))
    }

    if (isPatternCallback(argument)) {
        const parameter = argument.parameter ?? 'x'
        const body = argument.chain.reduce((code, modifier) => `${code}.${serializeCall(modifier)}`, parameter)
        return `${parameter} => ${body}`
    }

    if (Array.isArray(argument)) {
        return `[${argument.map(serializeArgument).join(', ')}]`
    }

    if (isPatternExpression(argument)) {
        return serializeExpression(argument)
    }

    throw new Error('Unsupported Strudel argument.')
}

/**
 * Converts a factory or modifier call into a Strudel call expression.
 *
 * @param call A discriminated factory or modifier call.
 * @returns The serialized call without a leading dot.
 *
 * @example
 * ```ts
 * serializeCall({ name: 'gain', args: [0.8] }) // 'gain(0.8)'
 * serializeCall({ name: 'silence', args: [] }) // 'silence'
 * ```
 */
const serializeCall = (call: PatternFactoryCall | PatternModifierCall): string => {
    if (call.name === 'silence') {
        return 'silence'
    }

    const args = call.args ?? []
    return `${call.name}(${args.map(serializeArgument).join(', ')})`
}

/**
 * Serializes a complete pattern root and its modifier chain.
 *
 * @param expression A typed pattern expression.
 * @returns Executable Strudel JavaScript.
 *
 * @example
 * ```ts
 * serializeExpression({
 *   root: { name: 's', args: ['bd'] },
 *   chain: [{ name: 'fast', args: [2] }],
 * }) // 's("bd").fast(2)'
 * ```
 */
const serializeExpression = (expression: PatternExpression): string => {
    const root = serializeCall(expression.root)
    return expression.chain?.reduce((code, modifier) => `${code}.${serializeCall(modifier)}`, root) ?? root
}

/**
 * Converts a typed pattern expression into executable Strudel JavaScript.
 *
 * Raw strings are returned unchanged so callers can gradually migrate from
 * handwritten Strudel code to the typed representation.
 *
 * @example
 * ```ts
 * toStrudelCode({
 *   root: { name: 's', args: ['bd sd'] },
 *   chain: [
 *     { name: 'gain', args: [0.8] },
 *     { name: 'fast', args: [2] },
 *   ],
 * })
 * // 's("bd sd").gain(0.8).fast(2)'
 * ```
 */
export const toStrudelCode = (input: StrudelCodeInput): string => {
    return typeof input === 'string' ? input : serializeExpression(input)
}