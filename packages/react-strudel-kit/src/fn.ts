import type {
    MiniPattern,
    NumericPattern,
    PatternCallback,
    PatternExpression,
    PatternModifierCall,
} from './types'
import { pattern } from './builders'
import type { PatternFactoryCall } from './types'
import { functionRegistry, type FactoryFunctionName, type FunctionName, type ModifierFunctionName } from './registry'

type ChildPatterns = readonly [PatternExpression, ...PatternExpression[]]
type CallbackArgs = readonly [PatternCallback]
type CycleCallbackArgs = readonly [number, PatternCallback]
type NumericCallbackArgs = readonly [NumericPattern, PatternCallback]

type FunctionArguments = {
    sample: readonly [MiniPattern]
    sound: readonly [MiniPattern]
    note: readonly [MiniPattern]
    n: readonly [NumericPattern]
    stack: ChildPatterns
    layer: ChildPatterns
    sequence: ChildPatterns
    cat: ChildPatterns
    silence: readonly []
    gain: readonly [NumericPattern]
    velocity: readonly [NumericPattern]
    pan: readonly [NumericPattern]
    orbit: readonly [NumericPattern]
    lowPass: readonly [NumericPattern]
    highPass: readonly [NumericPattern]
    room: readonly [NumericPattern]
    size: readonly [NumericPattern]
    fast: readonly [NumericPattern]
    slow: readonly [NumericPattern]
    clip: readonly [NumericPattern]
    compress: readonly [NumericPattern, NumericPattern]
    early: readonly [NumericPattern]
    late: readonly [NumericPattern]
    swing: readonly [NumericPattern]
    swingBy: readonly [NumericPattern, NumericPattern]
    rev: readonly []
    degrade: readonly []
    undegrade: readonly []
    every: CycleCallbackArgs
    firstOf: CycleCallbackArgs
    lastOf: CycleCallbackArgs
    sometimes: CallbackArgs
    often: CallbackArgs
    rarely: CallbackArgs
    sometimesBy: NumericCallbackArgs
    inside: NumericCallbackArgs
    outside: NumericCallbackArgs
    off: NumericCallbackArgs
    when: readonly [MiniPattern, PatternCallback]
}

const isFactory = (name: FunctionName): name is FactoryFunctionName => functionRegistry[name].kind === 'factory'

const toFactoryCall = (name: FactoryFunctionName, args: readonly unknown[]): PatternFactoryCall => {
    const runtimeName = functionRegistry[name].runtime

    if (runtimeName === 'silence') {
        return { name: 'silence' }
    }

    return { name: runtimeName as PatternFactoryCall['name'], args } as PatternFactoryCall
}

const toModifierCall = (name: ModifierFunctionName, args: readonly unknown[]): PatternModifierCall => {
    return { name: functionRegistry[name].runtime as PatternModifierCall['name'], args } as PatternModifierCall
}

/**
 * Creates a typed function expression from the shared function registry.
 *
 * Domain names are mapped to Strudel names during serialization, so callers
 * can use `sample`, `layer`, and `lowPass` without importing one helper per function.
 *
 * @example
 * ```ts
 * const expression = fn(
 *   'stack',
 *   fn('sample', mini('bd')),
 *   fn('note', mini('c3 eb3')),
 * )
 * // stack(s("bd"), note("c3 eb3"))
 * ```
 */
export function fn<Name extends FunctionName>(name: Name, ...args: FunctionArguments[Name]):
    Name extends FactoryFunctionName ? PatternExpression : PatternModifierCall
export function fn(name: FunctionName, ...args: readonly unknown[]): PatternExpression | PatternModifierCall {
    if (isFactory(name)) {
        return pattern(toFactoryCall(name, args))
    }

    return toModifierCall(name, args)
}
