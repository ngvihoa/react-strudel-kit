import { fn } from './fn'
import { mini } from './mini'
import { pitch, sequence } from './mini-ast'

fn('sample', mini('bd'))
fn('note', sequence(pitch('c3'), pitch('eb3')))
fn('gain', 0.8)
fn('rev')
fn('stack', fn('sample', mini('bd')), fn('sample', mini('hh')))

// @ts-expect-error Unknown registry names must be rejected.
fn('unknown', 1)

// @ts-expect-error Gain accepts numeric patterns, not arbitrary strings.
fn('gain', 'wrong')

// @ts-expect-error Zero-argument modifiers must not accept extra arguments.
fn('rev', 1)

// @ts-expect-error Factory functions require their declared arguments.
fn('sample')
