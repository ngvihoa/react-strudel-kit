import { chain, fn, pitch, rest, sample, sequence, weight } from 'react-strudel-kit'

// "Twinkle, Twinkle, Little Star": a traditional melody, four bars of four beats.

// #region bars
const bar1 = sequence(pitch('c4'), pitch('c4'), pitch('g4'), pitch('g4')) // Twin-kle twin-kle
const bar2 = sequence(pitch('a4'), pitch('a4'), weight(pitch('g4'), 2)) // lit-tle star (held)
const bar3 = sequence(pitch('f4'), pitch('f4'), pitch('e4'), pitch('e4')) // how I won-der
const bar4 = sequence(pitch('d4'), pitch('d4'), weight(pitch('c4'), 2)) // what you are (held)
// #endregion

// #region melody
export const twinkle = chain(
  // cat plays one pattern per cycle: bar 1, then 2, 3 and 4.
  fn('cat', fn('note', bar1), fn('note', bar2), fn('note', bar3), fn('note', bar4)),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
  fn('cpm', 25), // 100 BPM ÷ 4 beats per bar.
)
// #endregion

// #region detached
// Bars 2 and 4 again: the held note becomes a short note and a rest.
// Each bar still has four shares, so the timing of the next bar is unchanged.
const bar2Detached = sequence(pitch('a4'), pitch('a4'), pitch('g4'), rest())
const bar4Detached = sequence(pitch('d4'), pitch('d4'), pitch('c4'), rest())

export const twinkleDetached = chain(
  fn('cat',
    fn('note', bar1),
    fn('note', bar2Detached),
    fn('note', bar3),
    fn('note', bar4Detached),
  ),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
  fn('cpm', 25),
)
// #endregion
