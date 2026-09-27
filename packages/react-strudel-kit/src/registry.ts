/** Describes how a domain function maps to the Strudel runtime. */
export type FunctionRegistryEntry = {
    readonly runtime: string
    readonly kind: 'factory' | 'modifier'
}

/**
 * The domain-to-Strudel function registry.
 *
 * This is the single source of truth for public function names, runtime names,
 * and whether a call creates a pattern or extends one.
 */
export const functionRegistry = {
    sample: { runtime: 's', kind: 'factory' },
    sound: { runtime: 'sound', kind: 'factory' },
    note: { runtime: 'note', kind: 'factory' },
    n: { runtime: 'n', kind: 'factory' },
    stack: { runtime: 'stack', kind: 'factory' },
    layer: { runtime: 'stack', kind: 'factory' },
    sequence: { runtime: 'seq', kind: 'factory' },
    cat: { runtime: 'cat', kind: 'factory' },
    silence: { runtime: 'silence', kind: 'factory' },
    gain: { runtime: 'gain', kind: 'modifier' },
    velocity: { runtime: 'velocity', kind: 'modifier' },
    pan: { runtime: 'pan', kind: 'modifier' },
    orbit: { runtime: 'orbit', kind: 'modifier' },
    lowPass: { runtime: 'lpf', kind: 'modifier' },
    highPass: { runtime: 'hpf', kind: 'modifier' },
    room: { runtime: 'room', kind: 'modifier' },
    size: { runtime: 'size', kind: 'modifier' },
    fast: { runtime: 'fast', kind: 'modifier' },
    slow: { runtime: 'slow', kind: 'modifier' },
    clip: { runtime: 'clip', kind: 'modifier' },
    compress: { runtime: 'compress', kind: 'modifier' },
    early: { runtime: 'early', kind: 'modifier' },
    late: { runtime: 'late', kind: 'modifier' },
    swing: { runtime: 'swing', kind: 'modifier' },
    swingBy: { runtime: 'swingBy', kind: 'modifier' },
    rev: { runtime: 'rev', kind: 'modifier' },
    degrade: { runtime: 'degrade', kind: 'modifier' },
    undegrade: { runtime: 'undegrade', kind: 'modifier' },
    every: { runtime: 'every', kind: 'modifier' },
    firstOf: { runtime: 'firstOf', kind: 'modifier' },
    lastOf: { runtime: 'lastOf', kind: 'modifier' },
    sometimes: { runtime: 'sometimes', kind: 'modifier' },
    often: { runtime: 'often', kind: 'modifier' },
    rarely: { runtime: 'rarely', kind: 'modifier' },
    sometimesBy: { runtime: 'sometimesBy', kind: 'modifier' },
    inside: { runtime: 'inside', kind: 'modifier' },
    outside: { runtime: 'outside', kind: 'modifier' },
    off: { runtime: 'off', kind: 'modifier' },
    when: { runtime: 'when', kind: 'modifier' },
} as const satisfies Record<string, FunctionRegistryEntry>

/** All domain-level names available through `fn`. */
export type FunctionName = keyof typeof functionRegistry

/** Names that create a root pattern. */
export type FactoryFunctionName = {
    [Name in FunctionName]: typeof functionRegistry[Name]['kind'] extends 'factory' ? Name : never
}[FunctionName]

/** Names that append a modifier to a pattern. */
export type ModifierFunctionName = Exclude<FunctionName, FactoryFunctionName>
