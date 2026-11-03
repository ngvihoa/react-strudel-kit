import { chain, fn, number, pitch, repeat, rest, sample, sequence, stack } from 'react-strudel-kit'
import {
  HI_HAT_DEFAULTS, KICK, KICK_DEFAULTS, NOISE, SNARE_DEFAULTS, hiHatSound, kickSound, snareSound,
} from '../drums'
import { BASS_DEFAULTS, KEYS_DEFAULTS, bassSound, keysSound } from '../tonal'

const TEMPO = fn('cpm', 20) // 80 BPM ÷ 4 beats per bar.

// #region swing
// swingBy(1/3, 4): split each bar into 4 beats and delay the second half of
// every beat by a third of a half. The off-beat hi-hats lean late: a shuffle.
export const swungHats = chain(
  fn('sample', repeat(NOISE, 8)),
  ...hiHatSound(HI_HAT_DEFAULTS),
  fn('velocity', repeat(sequence(number(0.9), number(0.5)), 4)),
  fn('swingBy', 1 / 3, 4),
)
// #endregion

// #region drums
// The Cookbook sounds with different settings: a softer kick, a darker snare.
export const lazyDrums = fn('stack',
  chain(
    fn('note', sequence(KICK, rest(), rest(), KICK, rest(), rest(), KICK, rest())),
    ...kickSound({ ...KICK_DEFAULTS, pitchDrop: 12, decay: 0.2 }),
  ),
  chain(
    fn('sample', sequence(rest(), NOISE, rest(), NOISE)),
    ...snareSound({ ...SNARE_DEFAULTS, highCut: 4000, decay: 0.14 }),
  ),
  swungHats,
)
// #endregion

// #region chords
// Dm7 – G7 – Cmaj7 – Am7, one per bar. Spread the notes across octaves;
// each voice moves at most three semitones, including back to the first chord.
export const jazzyChords = chain(
  fn('cat',
    fn('note', stack(pitch('d3'), pitch('a3'), pitch('c4'), pitch('f4'))),
    fn('note', stack(pitch('d3'), pitch('g3'), pitch('b3'), pitch('f4'))),
    fn('note', stack(pitch('c3'), pitch('g3'), pitch('b3'), pitch('e4'))),
    fn('note', stack(pitch('c3'), pitch('g3'), pitch('a3'), pitch('e4'))),
  ),
  ...keysSound({ ...KEYS_DEFAULTS, brightness: 900, decay: 1.8, room: 0.5 }),
  fn('instrument', sample('triangle')), // Fewer upper harmonics than square.
  fn('attack', 0.035), // Ease into the chord instead of a sharp 2 ms onset.
  fn('release', 0.45),
)
// #endregion

// #region bass
export const roundBass = chain(
  fn('cat',
    fn('note', sequence(pitch('d2'), rest(), rest(), pitch('a1'))),
    fn('note', sequence(pitch('g1'), rest(), rest(), pitch('d2'))),
    fn('note', sequence(pitch('c2'), rest(), rest(), pitch('g1'))),
    fn('note', sequence(pitch('a1'), rest(), rest(), pitch('e2'))),
  ),
  ...bassSound({ ...BASS_DEFAULTS, cutoff: 300, sustain: 0.6 }),
)
// #endregion

// #region together
export const lofiLoop = chain(
  fn('stack', lazyDrums, jazzyChords, roundBass),
  fn('postGain', 0.85),
  fn('cpm', 20),
)
// #endregion

export const LOFI = {
  swing: chain(swungHats, TEMPO),
  drums: chain(lazyDrums, TEMPO),
  chords: chain(jazzyChords, TEMPO),
  bass: chain(roundBass, TEMPO),
  together: lofiLoop,
} as const
