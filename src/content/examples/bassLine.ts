import { chain, fn, pitch, rest, sequence } from 'react-strudel-kit'
import type { Pitch } from 'react-strudel-kit'
import { BASS_DEFAULTS, bassSound } from '../tonal'
import { kickOneThree, snareTwoFour } from './backbeat'

const TEMPO = fn('cpm', 25) // 100 BPM ÷ 4 beats per bar.

// #region roots
// One note per bar: the root (lowest note) of each chord in C – Am – F – G.
export const roots = chain(
  fn('cat',
    fn('note', pitch('c2')),
    fn('note', pitch('a1')),
    fn('note', pitch('f2')),
    fn('note', pitch('g2')),
  ),
  ...bassSound(BASS_DEFAULTS),
)
// #endregion

// #region bar
// A function writes the rhythm once; each bar passes its own root and fifth.
// The fifth is the note seven semitones (five letter names) above the root.
const bassBar = (root: Pitch, fifth: Pitch) => sequence(
  pitch(root), rest(), pitch(root), pitch(fifth),
  rest(), pitch(root), pitch(fifth), pitch(root),
)
// #endregion

// #region rhythm
export const walkingRoots = chain(
  fn('cat',
    fn('note', bassBar('c2', 'g2')), // C: C and G.
    fn('note', bassBar('a1', 'e2')), // Am: A and E.
    fn('note', bassBar('f2', 'c3')), // F: F and C.
    fn('note', bassBar('g2', 'd3')), // G: G and D.
  ),
  ...bassSound(BASS_DEFAULTS),
)
// #endregion

// #region with-drums
// The kick and snare from the Backbeat example, under the new bass line.
export const bassWithDrums = chain(
  fn('stack', walkingRoots, kickOneThree, snareTwoFour),
  fn('cpm', 25),
)
// #endregion

export const BASS_LINE = {
  roots: chain(roots, TEMPO),
  rhythm: chain(walkingRoots, TEMPO),
  withDrums: bassWithDrums,
} as const
