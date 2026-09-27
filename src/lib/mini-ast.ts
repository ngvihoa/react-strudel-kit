declare const miniNodeBrand: unique symbol

/** A pitch class with an optional sharp or flat accidental. */
export type PitchClass = `${'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'}${'' | '#' | 'b'}`

/** An octave supported by the typed pitch builder. */
export type Octave = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** A typed pitch token such as `c3`, `eb4`, or `f#2`. */
export type Pitch = `${PitchClass}${Octave}`

/** A sample identifier accepted by the typed sample builder. */
export type SampleName = string & { readonly [miniNodeBrand]: 'SampleName' }

/** An atomic Mini-Notation value. */
export type MiniAtom =
    | { readonly kind: 'sample'; readonly value: SampleName }
    | { readonly kind: 'pitch'; readonly value: Pitch }
    | { readonly kind: 'number'; readonly value: number }
    | { readonly kind: 'rest' }
    | { readonly kind: 'raw'; readonly value: string }

/** A sequence of values represented by whitespace in Mini-Notation. */
export type SequenceNode = {
    readonly kind: 'sequence'
    readonly items: readonly MiniNode[]
}

/** Values played in parallel, represented by commas. */
export type StackNode = {
    readonly kind: 'stack'
    readonly items: readonly MiniNode[]
}

/** Values from which Strudel chooses one, represented by pipes. */
export type ChoiceNode = {
    readonly kind: 'choice'
    readonly items: readonly MiniNode[]
}

/** A nested cycle represented by square brackets. */
export type SubcycleNode = {
    readonly kind: 'subcycle'
    readonly value: MiniNode
}

/** Parallel values with independent cycle lengths, represented by braces. */
export type PolymeterNode = {
    readonly kind: 'polymeter'
    readonly items: readonly MiniNode[]
}

/** Repeats a value with the `*` operator. */
export type RepeatNode = {
    readonly kind: 'repeat'
    readonly value: MiniNode
    readonly times: number
}

/** Speeds up or slows down a value with `*` or `/`. */
export type SpeedNode = {
    readonly kind: 'speed'
    readonly value: MiniNode
    readonly direction: 'fast' | 'slow'
    readonly factor: number
}

/** Changes a value's timing weight with `@`. */
export type WeightNode = {
    readonly kind: 'weight'
    readonly value: MiniNode
    readonly amount: number
}

/** Randomly removes a value with `?`. */
export type DegradeNode = {
    readonly kind: 'degrade'
    readonly value: MiniNode
    readonly probability?: number
}

/** Any typed Mini-Notation AST node. */
export type MiniNode = MiniAtom | SequenceNode | StackNode | ChoiceNode | SubcycleNode | PolymeterNode | RepeatNode | SpeedNode | WeightNode | DegradeNode

const node = <T extends MiniNode>(value: T): T => value

/** Creates a sample atom such as `bd` or `breaks165`. */
export const sample = (value: string): MiniNode => {
    if (!value || /[\s,[\]{}<>|.]/.test(value)) {
        throw new Error(`Invalid sample name: ${value}`)
    }

    return node({ kind: 'sample', value: value as SampleName })
}

/** Creates a typed pitch atom such as `c3` or `eb4`. */
export const pitch = (value: Pitch): MiniNode => node({ kind: 'pitch', value })

/** Creates a numeric atom. */
export const number = (value: number): MiniNode => {
    if (!Number.isFinite(value)) {
        throw new Error(`Invalid Mini-Notation number: ${value}`)
    }

    return node({ kind: 'number', value })
}

/** Creates a rest represented by `~`. */
export const rest = (): MiniNode => node({ kind: 'rest' })

/** Adds an intentional raw Mini-Notation token to the AST. */
export const raw = (value: string): MiniNode => node({ kind: 'raw', value })

/** Creates a whitespace-separated Mini-Notation sequence. */
export const sequence = (...items: readonly MiniNode[]): MiniNode => node({ kind: 'sequence', items })

/** Creates a comma-separated parallel stack. */
export const stack = (...items: readonly MiniNode[]): MiniNode => node({ kind: 'stack', items })

/** Creates a pipe-separated random choice. */
export const choice = (...items: readonly MiniNode[]): MiniNode => node({ kind: 'choice', items })

/** Wraps a value in square brackets. */
export const subcycle = (value: MiniNode): MiniNode => node({ kind: 'subcycle', value })

/** Creates a polymeter enclosed in braces. */
export const polymeter = (...items: readonly MiniNode[]): MiniNode => node({ kind: 'polymeter', items })

/** Repeats a value with `*times`. */
export const repeat = (value: MiniNode, times: number): MiniNode => {
    if (!Number.isInteger(times) || times < 1) {
        throw new Error(`Repeat count must be a positive integer: ${times}`)
    }

    return node({ kind: 'repeat', value, times })
}

/** Speeds up a value with `*factor`. */
export const fast = (value: MiniNode, factor: number): MiniNode => node({ kind: 'speed', value, direction: 'fast', factor })

/** Slows down a value with `/factor`. */
export const slow = (value: MiniNode, factor: number): MiniNode => node({ kind: 'speed', value, direction: 'slow', factor })

/** Applies an `@amount` timing weight. */
export const weight = (value: MiniNode, amount: number): MiniNode => node({ kind: 'weight', value, amount })

/** Applies Strudel's `?` degrade operator. */
export const degrade = (value: MiniNode, probability?: number): MiniNode => node({ kind: 'degrade', value, probability })
