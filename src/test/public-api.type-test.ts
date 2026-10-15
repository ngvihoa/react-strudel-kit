import {
    chain, fn, functionRegistry, mini, pattern, patternCallback, pitch, sequence,
    toStrudelCode,
} from 'react-strudel-kit'
import type {
    CompressModifier, FunctionArguments, FunctionName, FunctionRegistryEntry,
    FunctionResult, GainModifier, MiniPattern, PatternExpression, StrudelPattern, UseStrudelResult,
} from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

// Compile against the built declarations, without the app's ambient shims.
export const sampleName: 's' = fn('sample', mini('bd')).root.name
export const soundName: 'sound' = fn('sound', mini('bd')).root.name
export const layerName: 'stack' = fn('layer', fn('silence')).root.name
export const sequenceName: 'seq' = fn('sequence', fn('silence')).root.name
export const cutoffName: 'lpf' = fn('lowPass', 900).name
export const gain: GainModifier = fn('gain', 0.8)
export const gainArguments: readonly [number | MiniPattern] = fn('gain', 0.8).args
export const reverseArguments: readonly [] = fn('rev').args
export const compression: CompressModifier = fn('compress', 0.25, 0.75)
export const compressionResult: FunctionResult<'compress'> = compression
export const compressionArguments: FunctionArguments<'compress'> = [0.25, 0.75]
export const typedHook: () => UseStrudelResult = useStrudel

const transform = patternCallback(fn('rev'), fn('fast', 2))
export const complete: PatternExpression = chain(
    pattern(fn('sample', sequence(pitch('c3'), pitch('eb3'))).root),
    fn('early', 0.25), fn('late', 0.25), fn('swing', 4), fn('swingBy', 0.1, 4),
    fn('compress', 0.25, 0.75), fn('inside', 2, transform),
    fn('outside', 2, transform), fn('off', 0.5, transform),
    fn('sometimesBy', 0.5, transform), fn('when', mini('0 1'), transform),
)
toStrudelCode(complete)

type Assert<T extends true> = T
type MissingArguments = {
    [Name in FunctionName]: [FunctionArguments<Name>] extends [never] ? Name : never
}[FunctionName]
export type AllRegistryEntriesHaveArguments = Assert<[MissingArguments] extends [never] ? true : false>

declare const player: UseStrudelResult
player.play(complete)
player.play('note("c3")')
export const native: StrudelPattern = { play: () => native }
player.play(native)

// @ts-expect-error Unknown functions are not part of the registry.
fn('unknown', 1)
// @ts-expect-error Mini-Notation strings must be validated or built as an AST.
fn('sample', 'bd sd')
// @ts-expect-error Numeric controls reject arbitrary strings.
fn('gain', 'loud')
// @ts-expect-error Strict mode rejects null numeric arguments.
fn('gain', null)
// @ts-expect-error Strict mode rejects undefined factory inputs.
fn('sample', undefined)
// @ts-expect-error A zero-argument modifier cannot receive an argument.
fn('rev', 1)
// @ts-expect-error Compression needs both interval boundaries.
fn('compress', 0.25)
// @ts-expect-error A numeric pattern is required for the subdivision.
fn('swingBy', 0.1, 'four')
// @ts-expect-error A callback is required after the time offset.
fn('off', 0.25)
// @ts-expect-error Factory patterns cannot be used as callbacks.
fn('inside', 2, fn('sample', mini('bd')))
// @ts-expect-error Callbacks contain modifiers, not factories.
patternCallback(fn('sample', mini('bd')))
// @ts-expect-error Modifier calls cannot be passed as stack child patterns.
fn('stack', fn('gain', 1))
// @ts-expect-error Stack requires at least one child.
fn('stack')
// @ts-expect-error Chain requires a typed pattern expression.
chain('s("bd")', fn('gain', 1))
// @ts-expect-error Modifiers cannot be used as a pattern root.
pattern(fn('gain', 1))
// @ts-expect-error Return names stay literal, including aliases.
export const wrongName: 'hpf' = fn('lowPass', 900).name
// @ts-expect-error A registry factory must refer to a factory runtime name.
export const wrongEntry: FunctionRegistryEntry = { kind: 'factory', runtime: 'gain' }
// @ts-expect-error Runtime names must have a declared call contract.
export const unknownRuntime: FunctionRegistryEntry = { kind: 'modifier', runtime: 'notSupported' }

declare const uncertainName: 'sample' | 'gain'
// @ts-expect-error A union name cannot bypass one branch's argument contract.
fn(uncertainName, 1)
declare const uncertainCall: ['sample' | 'gain', number]
// @ts-expect-error A spread tuple must also correlate the name and arguments.
fn(...uncertainCall)

const sampleCall = ['sample', mini('bd')] as const
export const spreadResult: FunctionResult<'sample'> = fn(...sampleCall)

export const registryKind: 'factory' = functionRegistry.sample.kind
