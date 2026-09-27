import type { Pattern } from '@strudel/web'
import type { MiniNode } from './mini-ast'

declare const miniNotationBrand: unique symbol

/**
 * A Mini-Notation string that has passed Strudel's parser.
 *
 * @example
 * ```ts
 * import { mini } from './mini'
 *
 * const rhythm = mini('bd ~ sd ~')
 * const melody = mini('<c3 eb3 f3 g3>')
 * ```
 */
export type MiniNotation = string & { readonly [miniNotationBrand]: 'MiniNotation' }

/** A plain string accepted only when intentionally bypassing Mini-Notation validation. */
export type RawMiniNotation = string

/** A validated string or typed Mini-Notation AST value. */
export type MiniPattern = MiniNotation | MiniNode

/**
 * A scalar value or a mini-notation pattern for a numeric control.
 *
 * @example
 * ```ts
 * const fixedGain: NumericPattern = 0.8
 * const changingGain: NumericPattern = '<0.4 0.8 1>'
 * ```
 */
export type NumericPattern = number | MiniPattern

/**
 * A scalar value or a mini-notation pattern for a boolean control.
 *
 * @example
 * ```ts
 * const enabled: BooleanPattern = true
 * const alternating: BooleanPattern = '0 1'
 * ```
 */
export type BooleanPattern = boolean | MiniPattern

/**
 * A value that can be serialized as a Strudel function argument.
 *
 * Strings are quoted, arrays are serialized recursively, and nested pattern
 * expressions become nested Strudel calls.
 *
 * @example
 * ```ts
 * const args: readonly StrudelArgument[] = [
 *   'bd',
 *   0.8,
 *   { root: { name: 's', args: [mini('hh')] } },
 *   ['left', 'right'],
 * ]
 * // "bd", 0.8, s("hh"), ["left", "right"]
 * ```
 */
export type StrudelArgument =
    | string
    | number
    | boolean
    | null
    | MiniNode
    | PatternExpression
    | readonly StrudelArgument[]

/**
 * The name of a supported pattern factory.
 *
 * @example
 * ```ts
 * const factory: PatternFactoryName = 'stack'
 * // stack(...)
 * ```
 */
export type PatternFactoryName = 's' | 'sound' | 'note' | 'n' | 'stack' | 'seq' | 'cat' | 'silence'

/**
 * Creates a sample or synth pattern from mini-notation.
 *
 * @example
 * ```ts
 * const drums: SoundCall = { name: 's', args: [mini('bd sd')] }
 * // s("bd sd")
 * ```
 */
export type SoundCall = {
    readonly name: Extract<PatternFactoryName, 's' | 'sound'>
    readonly args: readonly [MiniPattern]
}

/**
 * Creates a pitch pattern from note names or mini-notation.
 *
 * @example
 * ```ts
 * const melody: NoteCall = { name: 'note', args: [mini('c3 eb3 g3')] }
 * // note("c3 eb3 g3")
 * ```
 */
export type NoteCall = {
    readonly name: Extract<PatternFactoryName, 'note'>
    readonly args: readonly [MiniPattern]
}

/**
 * Creates a numeric note-index pattern.
 *
 * @example
 * ```ts
 * const degrees: NoteIndexCall = { name: 'n', args: [mini('0 2 4 7')] }
 * // n("0 2 4 7")
 * ```
 */
export type NoteIndexCall = {
    readonly name: Extract<PatternFactoryName, 'n'>
    readonly args: readonly [NumericPattern]
}

/**
 * Stacks patterns so they play simultaneously.
 *
 * @example
 * ```ts
 * const layer: StackCall = {
 *   name: 'stack',
 *   args: [
 *     { root: { name: 's', args: [mini('bd ~ bd ~')] } },
 *     { root: { name: 's', args: [mini('~ hh ~ hh')] } },
 *   ],
 * }
 * // stack(s("bd ~ bd ~"), s("~ hh ~ hh"))
 * ```
 */
export type StackCall = {
    readonly name: Extract<PatternFactoryName, 'stack'>
    readonly args: readonly [PatternExpression, ...PatternExpression[]]
}

/**
 * Sequences patterns inside one cycle.
 *
 * @example
 * ```ts
 * const phrase: SequenceCall = {
 *   name: 'cat',
 *   args: [
 *     { root: { name: 'note', args: [mini('c3 e3')] } },
 *     { root: { name: 'note', args: [mini('g3 a3')] } },
 *   ],
 * }
 * // cat(note("c3 e3"), note("g3 a3"))
 * ```
 */
export type SequenceCall = {
    readonly name: Extract<PatternFactoryName, 'seq' | 'cat'>
    readonly args: readonly [PatternExpression, ...PatternExpression[]]
}

/**
 * Represents Strudel's silent pattern value.
 *
 * `silence` is serialized as a value, not as a function call.
 *
 * @example
 * ```ts
 * const rest: SilenceCall = { name: 'silence' }
 * // silence
 * ```
 */
export type SilenceCall = {
    readonly name: Extract<PatternFactoryName, 'silence'>
    readonly args?: readonly []
}

/**
 * A typed pattern factory call.
 *
 * @example
 * ```ts
 * const source: PatternFactoryCall = { name: 's', args: [mini('bd sd')] }
 * // Unsupported factory names are rejected by TypeScript.
 * ```
 */
export type PatternFactoryCall = SoundCall | NoteCall | NoteIndexCall | StackCall | SequenceCall | SilenceCall

/**
 * The name of a supported chainable pattern modifier.
 *
 * @example
 * ```ts
 * const modifier: PatternModifierName = 'lpf'
 * // .lpf(...)
 * ```
 */
export type PatternModifierName =
    | 'gain'
    | 'velocity'
    | 'pan'
    | 'orbit'
    | 'lpf'
    | 'hpf'
    | 'room'
    | 'size'
    | 'fast'
    | 'slow'
    | 'clip'
    | 'rev'
    | 'degrade'
    | 'undegrade'

/**
 * Changes event amplitude.
 *
 * @example
 * ```ts
 * const modifier: GainModifier = { name: 'gain', args: [0.75] }
 * // .gain(0.75)
 * ```
 */
export type GainModifier = {
    readonly name: Extract<PatternModifierName, 'gain'>
    readonly args: readonly [NumericPattern]
}

/**
 * Changes event velocity.
 *
 * @example
 * ```ts
 * const modifier: VelocityModifier = { name: 'velocity', args: [mini('0.5 1')] }
 * // .velocity("0.5 1")
 * ```
 */
export type VelocityModifier = {
    readonly name: Extract<PatternModifierName, 'velocity'>
    readonly args: readonly [NumericPattern]
}

/**
 * Changes event stereo position.
 *
 * @example
 * ```ts
 * const modifier: PanModifier = { name: 'pan', args: [-0.5] }
 * // .pan(-0.5)
 * ```
 */
export type PanModifier = {
    readonly name: Extract<PatternModifierName, 'pan'>
    readonly args: readonly [NumericPattern]
}

/**
 * Routes events to an audio orbit.
 *
 * @example
 * ```ts
 * const modifier: OrbitModifier = { name: 'orbit', args: [2] }
 * // .orbit(2)
 * ```
 */
export type OrbitModifier = {
    readonly name: Extract<PatternModifierName, 'orbit'>
    readonly args: readonly [NumericPattern]
}

/**
 * Applies a low-pass filter.
 *
 * @example
 * ```ts
 * const modifier: LowPassModifier = { name: 'lpf', args: [900] }
 * // .lpf(900)
 * ```
 */
export type LowPassModifier = {
    readonly name: Extract<PatternModifierName, 'lpf'>
    readonly args: readonly [NumericPattern]
}

/**
 * Applies a high-pass filter.
 *
 * @example
 * ```ts
 * const modifier: HighPassModifier = { name: 'hpf', args: [400] }
 * // .hpf(400)
 * ```
 */
export type HighPassModifier = {
    readonly name: Extract<PatternModifierName, 'hpf'>
    readonly args: readonly [NumericPattern]
}

/**
 * Controls the amount of room reverb.
 *
 * @example
 * ```ts
 * const modifier: RoomModifier = { name: 'room', args: [0.4] }
 * // .room(0.4)
 * ```
 */
export type RoomModifier = {
    readonly name: Extract<PatternModifierName, 'room'>
    readonly args: readonly [NumericPattern]
}

/**
 * Controls the reverb room size.
 *
 * @example
 * ```ts
 * const modifier: SizeModifier = { name: 'size', args: [0.8] }
 * // .size(0.8)
 * ```
 */
export type SizeModifier = {
    readonly name: Extract<PatternModifierName, 'size'>
    readonly args: readonly [NumericPattern]
}

/**
 * Speeds up a pattern by a numeric factor.
 *
 * @example
 * ```ts
 * const modifier: FastModifier = { name: 'fast', args: [2] }
 * // .fast(2)
 * ```
 */
export type FastModifier = {
    readonly name: Extract<PatternModifierName, 'fast'>
    readonly args: readonly [NumericPattern]
}

/**
 * Slows down a pattern by a numeric factor.
 *
 * @example
 * ```ts
 * const modifier: SlowModifier = { name: 'slow', args: [4] }
 * // .slow(4)
 * ```
 */
export type SlowModifier = {
    readonly name: Extract<PatternModifierName, 'slow'>
    readonly args: readonly [NumericPattern]
}

/**
 * Clips events to a numeric duration.
 *
 * @example
 * ```ts
 * const modifier: ClipModifier = { name: 'clip', args: [0.5] }
 * // .clip(0.5)
 * ```
 */
export type ClipModifier = {
    readonly name: Extract<PatternModifierName, 'clip'>
    readonly args: readonly [NumericPattern]
}

/**
 * Reverses the event order.
 *
 * @example
 * ```ts
 * const modifier: ReverseModifier = { name: 'rev' }
 * // .rev()
 * ```
 */
export type ReverseModifier = {
    readonly name: Extract<PatternModifierName, 'rev'>
    readonly args?: readonly []
}

/**
 * Randomly removes events using Strudel's default probability.
 *
 * @example
 * ```ts
 * const modifier: DegradeModifier = { name: 'degrade' }
 * // .degrade()
 * ```
 */
export type DegradeModifier = {
    readonly name: Extract<PatternModifierName, 'degrade'>
    readonly args?: readonly []
}

/**
 * Restores events removed by degradation.
 *
 * @example
 * ```ts
 * const modifier: UndegradeModifier = { name: 'undegrade' }
 * // .undegrade()
 * ```
 */
export type UndegradeModifier = {
    readonly name: Extract<PatternModifierName, 'undegrade'>
    readonly args?: readonly []
}

/**
 * A typed chainable modifier call.
 *
 * @example
 * ```ts
 * const modifier: PatternModifierCall = { name: 'room', args: [0.5] }
 * // .room(0.5)
 * ```
 */
export type PatternModifierCall =
    | GainModifier
    | VelocityModifier
    | PanModifier
    | OrbitModifier
    | LowPassModifier
    | HighPassModifier
    | RoomModifier
    | SizeModifier
    | FastModifier
    | SlowModifier
    | ClipModifier
    | ReverseModifier
    | DegradeModifier
    | UndegradeModifier

/**
 * A serializable Strudel pattern made from a factory and optional modifiers.
 *
 * @example
 * ```ts
 * const pattern: PatternExpression = {
 *   root: { name: 's', args: [mini('bd sd')] },
 *   chain: [
 *     { name: 'gain', args: [0.8] },
 *     { name: 'lpf', args: [1200] },
 *   ],
 * }
 * // s("bd sd").gain(0.8).lpf(1200)
 * ```
 */
export type PatternExpression = {
    readonly root: PatternFactoryCall
    readonly chain?: readonly PatternModifierCall[]
}

/**
 * A typed pattern expression or a raw Strudel code string.
 *
 * @example
 * ```ts
 * const typed: StrudelCodeInput = { root: { name: 's', args: [mini('bd')] } }
 * const legacy: StrudelCodeInput = 's("bd")'
 * ```
 */
export type StrudelCodeInput = string | PatternExpression

/**
 * The current playback state exposed by the React integration.
 *
 * @example
 * ```ts
 * const status: TransportStatus = 'playing'
 * if (status === 'error') {
 *   // Render the error state.
 * }
 * ```
 */
export type TransportStatus = 'idle' | 'playing' | 'error'

/**
 * A native Strudel Pattern instance supplied directly by a caller.
 *
 * @example
 * ```ts
 * const nativePattern: StrudelPattern = stack(
 *   s('bd sd'),
 *   note('c3 eb3'),
 * )
 * await play(nativePattern)
 * ```
 */
export type StrudelPattern = Pattern

/**
 * Any input accepted by the package transport.
 *
 * @example
 * ```ts
 * await play({ root: { name: 's', args: [mini('bd sd')] } })
 * await play('s("bd sd")')
 * await play(nativePattern)
 * ```
 */
export type StrudelInput = StrudelCodeInput | StrudelPattern

/**
 * Categories used to explain a normalized transport error.
 *
 * @example
 * ```ts
 * const code: StrudelErrorCode = 'evaluation'
 * ```
 */
export type StrudelErrorCode = 'initialization' | 'evaluation' | 'transport' | 'unknown'

/**
 * A serializable error shape returned by the Strudel integration.
 *
 * @example
 * ```ts
 * const error: StrudelError = {
 *   code: 'evaluation',
 *   message: 'Invalid pattern',
 * }
 * ```
 */
export type StrudelError = {
    readonly code: StrudelErrorCode
    readonly message: string
    readonly cause?: unknown
}

/**
 * The transport controls and state returned by `useStrudel`.
 *
 * @example
 * ```tsx
 * const { play, stop, status, error } = useStrudel()
 *
 * return (
 *   <>
 *     <button onClick={() => play({ root: { name: 's', args: [mini('bd')] } })}>
 *       Play
 *     </button>
 *     <button onClick={stop}>Stop</button>
 *     <output>{status}</output>
 *     {error && <p>{error.message}</p>}
 *   </>
 * )
 * ```
 */
export type UseStrudelResult = {
    readonly status: TransportStatus
    readonly error: StrudelError | null
    readonly play: (input: StrudelInput) => Promise<void>
    readonly stop: () => void
}
