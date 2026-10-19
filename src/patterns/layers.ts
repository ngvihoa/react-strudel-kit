import { chain, fn, mini } from 'react-strudel-kit'

const melody = chain(
  fn('note', mini('c4 ~ e4 g4')),
  fn('instrument', mini('triangle')),
  fn('gain', 0.25),
)

const bass = chain(
  fn('note', mini('<c2 a1 f2 g2>')),
  fn('instrument', mini('sine')),
  fn('gain', 0.4),
)

export const layers = chain(
  fn('stack', melody, bass),
  fn('cpm', 30),
)

export const LAYER_PARTS = { melody, bass } as const
