import { chain, fn } from 'react-strudel-kit'
import { LAYERS } from '../examples/layerASong'

// #region practice
export const makeArrangement = (bpm: number, melodyLevel: number) => chain(
  fn('stack',
    chain(LAYERS.drums, fn('velocity', 0.9)),
    chain(LAYERS.bass, fn('velocity', 1)),
    chain(LAYERS.chords, fn('velocity', 0.6)),
    chain(LAYERS.melody, fn('velocity', melodyLevel)),
  ),
  fn('postGain', 0.8),
  fn('cpm', bpm / 4),
)
// #endregion
