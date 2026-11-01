import { chain, fn, pitch, rest, sample, sequence, weight } from 'react-strudel-kit'

// Every step plays at 30 cycles per minute: one cycle (one bar) every two seconds.
const TEMPO = fn('cpm', 30)

// #region one-note
export const oneNote = chain(
  fn('note', pitch('c4')),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
)
// #endregion

// #region four-notes
export const fourNotes = chain(
  fn('note', sequence(
    pitch('c4'),
    pitch('e4'),
    pitch('g4'),
    pitch('b4'),
  )),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
)
// #endregion

// #region long-and-rest
export const longAndRest = chain(
  fn('note', sequence(
    weight(pitch('c4'), 2), // Two shares of the bar: a longer note.
    pitch('e4'),
    rest(), // One share of silence.
  )),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
)
// #endregion

export const FIRST_SONG_STEPS = {
  oneNote: chain(oneNote, TEMPO),
  fourNotes: chain(fourNotes, TEMPO),
  longAndRest: chain(longAndRest, TEMPO),
} as const
