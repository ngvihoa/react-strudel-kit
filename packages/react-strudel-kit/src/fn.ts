import type {
    PatternExpression, PatternFactoryCall, PatternFactoryName, PatternModifierCall,
    PatternModifierName, StrudelArgument,
} from './types'
import { functionRegistry, type FactoryFunctionName, type FunctionName, type ModifierFunctionName } from './registry'

type RuntimeCall<Name extends FunctionName> = Extract<
    PatternFactoryCall | PatternModifierCall,
    { readonly name: typeof functionRegistry[Name]['runtime'] }
>

/** Argument tuple for a supported function, derived from its runtime call. */
export type FunctionArguments<Name extends FunctionName> = NonNullable<RuntimeCall<Name>['args']>

type FunctionResults = {
    [Name in FactoryFunctionName]: Pick<PatternExpression, 'chain'> & { readonly root: RuntimeCall<Name> }
} & {
    [Name in ModifierFunctionName]: RuntimeCall<Name> & { readonly args: FunctionArguments<Name> }
}

/** Exact runtime call for modifiers, or a typed expression for factories. */
export type FunctionResult<Name extends FunctionName> = FunctionResults[Name]

type UnionToIntersection<Union> = (
    Union extends unknown ? (value: Union) => void : never
) extends (value: infer Intersection) => void ? Intersection : never

type FunctionApi = UnionToIntersection<{
    [Name in FunctionName]: (name: Name, ...args: FunctionArguments<Name>) => FunctionResult<Name>
}[FunctionName]>

type RuntimeResult =
    | { readonly root: { readonly name: PatternFactoryName; readonly args?: readonly StrudelArgument[] } }
    | { readonly name: PatternModifierName; readonly args?: readonly StrudelArgument[] }

const createFunction = (name: FunctionName, ...args: readonly StrudelArgument[]): RuntimeResult => {
    const entry = functionRegistry[name]
    if (entry.kind === 'factory') {
        return {
            root: entry.runtime === 'silence'
                ? { name: entry.runtime }
                : { name: entry.runtime, args },
        } satisfies RuntimeResult
    }
    return { name: entry.runtime, args } satisfies RuntimeResult
}

// The implementation constructs the mapped runtime name and forwards its arguments.
// The assertion exposes one checked overload per registry entry, without allowing
// a generic union name to mix one function's arguments with another's name.
/**
 * Creates a typed function expression from the shared function registry.
 *
 * Domain names map to Strudel names, such as `sample` -> `s` and `lowPass` -> `lpf`.
 * Both argument tuples and return types derive from the runtime call contracts.
 *
 * @example
 * ```ts
 * fn('stack', fn('sample', mini('bd')), fn('note', mini('c3 eb3')))
 * // stack(s("bd"), note("c3 eb3"))
 * ```
 */
export const fn = createFunction as FunctionApi
