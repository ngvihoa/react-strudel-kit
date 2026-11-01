import { chain, fn, repeat, rest, sequence } from 'react-strudel-kit'
import { HI_HAT_DEFAULTS, KICK, KICK_DEFAULTS, NOISE, hiHatSound, kickSound } from '../drums'

const TEMPO = fn('cpm', 30) // 120 BPM ÷ 4 beats per bar.

// #region kicks
// Four equal slots, a kick in each: one on every beat.
export const kicks = chain(
  fn('note', sequence(KICK, KICK, KICK, KICK)),
  ...kickSound(KICK_DEFAULTS),
)
// #endregion

// #region hats
// Eight slots, a hi-hat in every second one: exactly between the kicks.
export const offBeatHats = chain(
  fn('sample', sequence(rest(), NOISE, rest(), NOISE, rest(), NOISE, rest(), NOISE)),
  ...hiHatSound(HI_HAT_DEFAULTS),
)
// #endregion

// #region together
export const fourOnTheFloor = chain(
  fn('stack', kicks, offBeatHats), // Both parts at once.
  fn('cpm', 30), // 120 BPM.
)
// #endregion

// #region repeat
// The same hi-hats, written as a two-slot figure repeated four times.
export const offBeatHatsRepeat = chain(
  fn('sample', repeat(sequence(rest(), NOISE), 4)),
  ...hiHatSound(HI_HAT_DEFAULTS),
)
// #endregion

export const FOUR_ON_THE_FLOOR = {
  kicks: chain(kicks, TEMPO),
  hats: chain(offBeatHats, TEMPO),
  together: fourOnTheFloor,
  repeat: chain(fn('stack', kicks, offBeatHatsRepeat), TEMPO),
} as const
