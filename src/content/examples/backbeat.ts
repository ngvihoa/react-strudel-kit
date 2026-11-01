import { chain, fn, repeat, rest, sequence } from 'react-strudel-kit'
import { HI_HAT_DEFAULTS, KICK, KICK_DEFAULTS, NOISE, SNARE_DEFAULTS, hiHatSound, kickSound, snareSound } from '../drums'

const TEMPO = fn('cpm', 25) // 100 BPM ÷ 4 beats per bar.

// #region backbeat
// Kick on beats 1 and 3, snare on 2 and 4: the backbeat under most pop and rock.
export const kickOneThree = chain(
  fn('note', sequence(KICK, rest(), KICK, rest())),
  ...kickSound(KICK_DEFAULTS),
)
export const snareTwoFour = chain(
  fn('sample', sequence(rest(), NOISE, rest(), NOISE)),
  ...snareSound(SNARE_DEFAULTS),
)
// #endregion

// #region with-hats
export const eighthHats = chain(
  fn('sample', repeat(NOISE, 8)), // Eight hi-hats: two per beat.
  ...hiHatSound(HI_HAT_DEFAULTS),
)

export const rockBeat = chain(
  fn('stack', kickOneThree, snareTwoFour, eighthHats),
  fn('cpm', 25),
)
// #endregion

// #region busier-kick
// Eight slots for the kick, while the snare keeps four: each part picks its own grid.
// Kick on beat 1, beat 3 and the half beat after it.
export const busierKick = chain(
  fn('note', sequence(KICK, rest(), rest(), rest(), KICK, KICK, rest(), rest())),
  ...kickSound(KICK_DEFAULTS),
)

export const rockBeatBusier = chain(
  fn('stack', busierKick, snareTwoFour, eighthHats),
  fn('cpm', 25),
)
// #endregion

export const BACKBEAT = {
  backbeat: chain(fn('stack', kickOneThree, snareTwoFour), TEMPO),
  withHats: rockBeat,
  busier: rockBeatBusier,
} as const
