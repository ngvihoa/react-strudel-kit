import type {
    NumericPattern,
    PatternCallback,
    PatternExpression,
    PatternFactoryCall,
    PatternModifierCall,
} from './types'
import type { MiniPattern } from './types'

/** Creates a typed sample or synth pattern. */
export const s = (value: MiniPattern): PatternExpression => pattern({ name: 's', args: [value] })

/** Creates a typed sample or synth pattern using the explicit `sound` alias. */
export const sound = (value: MiniPattern): PatternExpression => pattern({ name: 'sound', args: [value] })

/** Creates a typed pitch pattern. */
export const note = (value: MiniPattern): PatternExpression => pattern({ name: 'note', args: [value] })

/** Creates a typed numeric note-index pattern. */
export const n = (value: NumericPattern): PatternExpression => pattern({ name: 'n', args: [value] })

/** Creates a typed pattern that plays child patterns simultaneously. */
export const stackPattern = (first: PatternExpression, ...rest: readonly PatternExpression[]): PatternExpression => pattern({ name: 'stack', args: [first, ...rest] })

/** Creates a typed sequential pattern from child patterns. */
export const sequencePattern = (first: PatternExpression, ...rest: readonly PatternExpression[]): PatternExpression => pattern({ name: 'seq', args: [first, ...rest] })

/** Creates a typed cycle-concatenated pattern from child patterns. */
export const cat = (first: PatternExpression, ...rest: readonly PatternExpression[]): PatternExpression => pattern({ name: 'cat', args: [first, ...rest] })

/** Creates the Strudel silence value. */
export const silence = (): PatternExpression => pattern({ name: 'silence' })

/** Creates a pattern expression from a root factory and optional modifiers. */
export const pattern = (root: PatternFactoryCall, chain: readonly PatternModifierCall[] = []): PatternExpression => ({
    root,
    ...(chain.length > 0 ? { chain } : {}),
})

/** Creates a callback body applied to the implicit `x` pattern parameter. */
export const patternCallback = (...chain: readonly PatternModifierCall[]): PatternCallback => ({ chain })

/** Adds an amplitude modifier. */
export const gain = (value: NumericPattern): PatternModifierCall => ({ name: 'gain', args: [value] })

/** Adds a velocity modifier. */
export const velocity = (value: NumericPattern): PatternModifierCall => ({ name: 'velocity', args: [value] })

/** Adds a stereo position modifier. */
export const pan = (value: NumericPattern): PatternModifierCall => ({ name: 'pan', args: [value] })

/** Adds an audio orbit modifier. */
export const orbit = (value: NumericPattern): PatternModifierCall => ({ name: 'orbit', args: [value] })

/** Adds a low-pass filter modifier. */
export const lpf = (value: NumericPattern): PatternModifierCall => ({ name: 'lpf', args: [value] })

/** Adds a high-pass filter modifier. */
export const hpf = (value: NumericPattern): PatternModifierCall => ({ name: 'hpf', args: [value] })

/** Adds a room reverb modifier. */
export const room = (value: NumericPattern): PatternModifierCall => ({ name: 'room', args: [value] })

/** Adds a reverb size modifier. */
export const size = (value: NumericPattern): PatternModifierCall => ({ name: 'size', args: [value] })

/** Adds a pattern speed-up modifier. */
export const fast = (value: NumericPattern): PatternModifierCall => ({ name: 'fast', args: [value] })

/** Adds a pattern slow-down modifier. */
export const slow = (value: NumericPattern): PatternModifierCall => ({ name: 'slow', args: [value] })

/** Adds a clipping modifier. */
export const clip = (value: NumericPattern): PatternModifierCall => ({ name: 'clip', args: [value] })

/** Adds a reverse modifier. */
export const rev = (): PatternModifierCall => ({ name: 'rev' })

/** Adds a default-probability degrade modifier. */
export const degrade = (): PatternModifierCall => ({ name: 'degrade' })

/** Adds an undegrade modifier. */
export const undegrade = (): PatternModifierCall => ({ name: 'undegrade' })

/** Applies a callback every number of cycles. */
export const every = (cycles: number, callback: PatternCallback): PatternModifierCall => ({ name: 'every', args: [cycles, callback] })

/** Applies a callback starting from the first cycle. */
export const firstOf = (cycles: number, callback: PatternCallback): PatternModifierCall => ({ name: 'firstOf', args: [cycles, callback] })

/** Applies a callback starting from the last cycle. */
export const lastOf = (cycles: number, callback: PatternCallback): PatternModifierCall => ({ name: 'lastOf', args: [cycles, callback] })

/** Applies a callback with 50% probability. */
export const sometimes = (callback: PatternCallback): PatternModifierCall => ({ name: 'sometimes', args: [callback] })

/** Applies a callback with high probability. */
export const often = (callback: PatternCallback): PatternModifierCall => ({ name: 'often', args: [callback] })

/** Applies a callback with low probability. */
export const rarely = (callback: PatternCallback): PatternModifierCall => ({ name: 'rarely', args: [callback] })

/** Applies a callback while a Mini-Notation condition is active. */
export const when = (condition: MiniPattern, callback: PatternCallback): PatternModifierCall => ({ name: 'when', args: [condition, callback] })

/**
 * Appends modifiers to a typed pattern expression.
 *
 * @param input A typed expression or raw Strudel code.
 * @param modifiers Modifiers to append in order.
 * @returns A typed pattern expression, or the raw input unchanged when given a string.
 */
export const chain = (input: PatternExpression, ...modifiers: readonly PatternModifierCall[]): PatternExpression => ({
    root: input.root,
    chain: [...(input.chain ?? []), ...modifiers],
})

