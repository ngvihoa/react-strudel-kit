import { chain, fn, number, repeat, sequence } from 'react-strudel-kit'
import { eighthHats, kickOneThree, snareTwoFour } from '../examples/backbeat'

// #region practice
// Keep each sound and rhythm; change only the accents and the tempo.
export const makeBeat = (bpm: number, offBeat: number) => chain(
  fn('stack',
    kickOneThree,
    snareTwoFour,
    chain(eighthHats, fn('velocity', repeat(sequence(number(1), number(offBeat)), 4))),
  ),
  fn('cpm', bpm / 4),
)
// #endregion
