import { chain, fn, pitch, repeat, rest, sample, sequence, weight } from 'react-strudel-kit'
import type { Pitch } from 'react-strudel-kit'
import type { Waveform } from '../mixer'

// Steps 1–3 play at the tempo set in step 4: one bar every two seconds.
const TEMPO = fn('cpm', 30)

// #region one-note
export const oneNote = chain(
  fn('note', pitch('c4')), // Middle C.
  fn('instrument', sample('triangle')), // A soft built-in synth.
  fn('gain', 0.3), // Loudness: keep it low while you experiment.
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
    pitch('e4'), // One share.
    rest(), // One share of silence.
  )),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
)
// #endregion

// #region held
// C gets two of four shares — half the bar — and plays once.
export const held = chain(
  fn('note', sequence(weight(pitch('c4'), 2), pitch('e4'), pitch('g4'))),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
)
// #endregion

// #region repeated
// Same half bar for C, but repeat() fits two strikes inside it.
export const repeated = chain(
  fn('note', sequence(weight(repeat(pitch('c4'), 2), 2), pitch('e4'), pitch('g4'))),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
)
// #endregion

// #region tempo
// cpm = cycles per minute. One cycle is one bar here,
// so 30 cpm plays one bar every two seconds.
export const withTempo = chain(fourNotes, fn('cpm', 30))
// #endregion

export type TuneSlot = Pitch | 'rest'
export type TuneSettings = { slots: readonly TuneSlot[], sound: Waveform, bpm: number }

export const TUNE_DEFAULTS: TuneSettings = { slots: ['c4', 'e4', 'g4', 'rest'], sound: 'triangle', bpm: 120 }

// #region my-tune
export const myTune = ({ slots, sound, bpm }: TuneSettings) => chain(
  fn('note', sequence(
    // Each slot is a note name or 'rest'.
    ...slots.map((slot) => slot === 'rest' ? rest() : pitch(slot)),
  )),
  fn('instrument', sample(sound)),
  fn('gain', 0.3),
  fn('cpm', bpm / 4), // Four beats per bar: BPM ÷ 4.
)
// #endregion

export const FIRST_SONG_STEPS = {
  oneNote: chain(oneNote, TEMPO),
  fourNotes: chain(fourNotes, TEMPO),
  longAndRest: chain(longAndRest, TEMPO),
  held: chain(held, TEMPO),
  repeated: chain(repeated, TEMPO),
  withTempo,
} as const
