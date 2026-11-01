import { chain, fn, pitch, repeat, sequence } from 'react-strudel-kit'
import type { Pitch } from 'react-strudel-kit'
import { CHORDS, KEYS_DEFAULTS, PAD_DEFAULTS, keysSound, padSound } from '../tonal'
import { roots } from './bassLine'

const TEMPO = fn('cpm', 25) // 100 BPM ÷ 4 beats per bar.

// #region block
// Each chord struck once per bar: all its notes at the same time.
export const blockChords = chain(
  fn('cat',
    fn('note', CHORDS.C),
    fn('note', CHORDS.Am),
    fn('note', CHORDS.F),
    fn('note', CHORDS.G),
  ),
  ...keysSound(KEYS_DEFAULTS),
)
// #endregion

// #region arpeggio
// The same notes one at a time: sequence instead of stack.
// Low, middle, high, middle — played twice per bar with repeat().
const arpeggio = (low: Pitch, middle: Pitch, high: Pitch) =>
  repeat(sequence(pitch(low), pitch(middle), pitch(high), pitch(middle)), 2)

export const arpeggios = chain(
  fn('cat',
    fn('note', arpeggio('c4', 'e4', 'g4')),
    fn('note', arpeggio('c4', 'e4', 'a4')),
    fn('note', arpeggio('c4', 'f4', 'a4')),
    fn('note', arpeggio('b3', 'd4', 'g4')),
  ),
  ...keysSound(KEYS_DEFAULTS),
)
// #endregion

// #region together
// Arpeggios on top, held pad chords in the middle, roots underneath.
export const harmony = chain(
  fn('stack',
    arpeggios,
    chain(fn('cat', fn('note', CHORDS.C), fn('note', CHORDS.Am), fn('note', CHORDS.F), fn('note', CHORDS.G)), ...padSound(PAD_DEFAULTS)),
    roots,
  ),
  fn('cpm', 25),
)
// #endregion

export const CHORD_EXAMPLES = {
  block: chain(blockChords, TEMPO),
  arpeggio: chain(arpeggios, TEMPO),
  together: harmony,
} as const
