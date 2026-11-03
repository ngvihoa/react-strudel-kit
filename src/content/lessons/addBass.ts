import { chain, fn } from 'react-strudel-kit'
import { eighthHats, kickOneThree, snareTwoFour } from '../examples/backbeat'
import { walkingRoots } from '../examples/bassLine'

// #region practice
export const makeBassMix = (bpm: number, bassLevel: number) => chain(
  fn('stack',
    kickOneThree,
    snareTwoFour,
    eighthHats,
    chain(walkingRoots, fn('velocity', bassLevel)), // Balance the bass without replacing its gain.
  ),
  fn('cpm', bpm / 4),
)
// #endregion
