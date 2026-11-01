import { chain, fn, number, repeat, sequence } from 'react-strudel-kit'
import { HI_HAT_DEFAULTS, NOISE, hiHatSound } from '../drums'

const TEMPO = fn('cpm', 25) // 100 BPM ÷ 4 beats per bar.

// #region flat
// Eight identical strikes: correct, but mechanical.
export const flatHats = chain(
  fn('sample', repeat(NOISE, 8)),
  ...hiHatSound(HI_HAT_DEFAULTS),
)
// #endregion

// #region accented
// velocity scales each strike (1 = as loud as the sound allows).
// This velocity pattern also has eight slots, one per strike:
// loud on each beat, softer in between.
export const accentedHats = chain(
  flatHats,
  fn('velocity', repeat(sequence(number(1), number(0.45)), 4)),
)
// #endregion

// #region swell
// Only four velocity slots for eight strikes. Each strike takes the value
// current when it starts, so every value covers two strikes: a crescendo.
export const swellingHats = chain(
  flatHats,
  fn('velocity', sequence(number(0.3), number(0.55), number(0.8), number(1))),
)
// #endregion

export const HI_HAT_ACCENTS = {
  flat: chain(flatHats, TEMPO),
  accented: chain(accentedHats, TEMPO),
  swell: chain(swellingHats, TEMPO),
} as const
