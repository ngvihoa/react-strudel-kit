import { chain, fn, pitch, rest, sequence, weight } from 'react-strudel-kit'
import { LEAD_DEFAULTS, leadSound } from '../tonal'
import { arpeggios } from './chords'
import { walkingRoots } from './bassLine'
import { eighthHats, kickOneThree, snareTwoFour } from './backbeat'

const TEMPO = fn('cpm', 25) // 100 BPM ÷ 4 beats per bar.

// #region drums
export const drums = fn('stack', kickOneThree, snareTwoFour, eighthHats)
// #endregion

// #region melody
// Four bars over C – Am – F – G. Most notes belong to the chord underneath;
// the others (D, B, and the E that ends bar 3) step between chord notes.
export const melody = chain(
  fn('cat',
    fn('note', sequence(pitch('e5'), pitch('d5'), weight(pitch('c5'), 2))),
    fn('note', sequence(pitch('c5'), pitch('b4'), weight(pitch('a4'), 2))),
    fn('note', sequence(pitch('a4'), pitch('c5'), pitch('f5'), pitch('e5'))),
    fn('note', sequence(weight(pitch('d5'), 3), rest())),
  ),
  ...leadSound(LEAD_DEFAULTS),
)
// #endregion

// #region together
// velocity scales a whole part without touching its sound: the mix balance.
export const song = chain(
  fn('stack',
    chain(drums, fn('velocity', 0.9)),
    chain(walkingRoots, fn('velocity', 1)),
    chain(arpeggios, fn('velocity', 0.6)), // Background: quieter.
    chain(melody, fn('velocity', 1)), // Foreground: full.
  ),
  fn('postGain', 0.8), // Turn the whole mix down a little.
  fn('cpm', 25),
)
// #endregion

/** The four layers on their own, for the page players and the React example. */
export const LAYERS = { drums, bass: walkingRoots, chords: arpeggios, melody } as const

export const LAYER_A_SONG = {
  drums: chain(drums, TEMPO),
  bass: chain(walkingRoots, TEMPO),
  chords: chain(arpeggios, TEMPO),
  melody: chain(melody, TEMPO),
  song,
} as const
