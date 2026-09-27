import type {
    MiniPattern,
    NumericPattern,
    PatternCallback,
    PatternExpression,
    PatternModifierCall,
} from './types'
import { pattern } from './builders'
import type { PatternFactoryCall } from './types'

/** Names accepted by the generic type-safe function registry. */
export type FunctionName =
    | 'sample'
    | 'sound'
    | 'note'
    | 'n'
    | 'stack'
    | 'layer'
    | 'sequence'
    | 'cat'
    | 'silence'
    | 'gain'
    | 'velocity'
    | 'pan'
    | 'orbit'
    | 'lowPass'
    | 'highPass'
    | 'room'
    | 'size'
    | 'fast'
    | 'slow'
    | 'clip'
    | 'rev'
    | 'degrade'
    | 'undegrade'
    | 'every'
    | 'firstOf'
    | 'lastOf'
    | 'sometimes'
    | 'often'
    | 'rarely'
    | 'when'

type ChildPatterns = readonly [PatternExpression, ...PatternExpression[]]
type CallbackArgs = readonly [PatternCallback]
type CycleCallbackArgs = readonly [number, PatternCallback]

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
    rev: readonly []
    degrade: readonly []
    undegrade: readonly []
    every: CycleCallbackArgs
    firstOf: CycleCallbackArgs
    lastOf: CycleCallbackArgs
    sometimes: CallbackArgs
    often: CallbackArgs
    rarely: CallbackArgs
    when: readonly [MiniPattern, PatternCallback]
}

type FactoryFunctionName = 'sample' | 'sound' | 'note' | 'n' | 'stack' | 'layer' | 'sequence' | 'cat' | 'silence'
type ModifierFunctionName = Exclude<FunctionName, FactoryFunctionName>

/** Maps domain-friendly names to Strudel runtime names. */
const strudelNames: Record<FunctionName, string> = {
    sample: 's',
    sound: 'sound',
    note: 'note',
    n: 'n',
    stack: 'stack',
    layer: 'stack',
    sequence: 'seq',
    cat: 'cat',
    silence: 'silence',
    gain: 'gain',
    velocity: 'velocity',
    pan: 'pan',
    orbit: 'orbit',
    lowPass: 'lpf',
    highPass: 'hpf',
    room: 'room',
    size: 'size',
    fast: 'fast',
    slow: 'slow',
    clip: 'clip',
    rev: 'rev',
    degrade: 'degrade',
    undegrade: 'undegrade',
    every: 'every',
    firstOf: 'firstOf',
    lastOf: 'lastOf',
    sometimes: 'sometimes',
    often: 'often',
    rarely: 'rarely',
    when: 'when',
}

const factoryNames = new Set<FactoryFunctionName>(['sample', 'sound', 'note', 'n', 'stack', 'layer', 'sequence', 'cat', 'silence'])

const isFactory = (name: FunctionName): name is FactoryFunctionName => factoryNames.has(name as FactoryFunctionName)

const toFactoryCall = (name: FactoryFunctionName, args: readonly unknown[]): PatternFactoryCall => {
    const runtimeName = strudelNames[name]

    if (runtimeName === 'silence') {
        return { name: 'silence' }
    }

    return { name: runtimeName as PatternFactoryCall['name'], args } as PatternFactoryCall
}

const toModifierCall = (name: ModifierFunctionName, args: readonly unknown[]): PatternModifierCall => {
    return { name: strudelNames[name] as PatternModifierCall['name'], args } as PatternModifierCall
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
