import { chain, fn, mini } from 'react-strudel-kit'

export const bassPart = chain(
  fn('note', mini('<c2 a1 f2 g2>')),
  fn('instrument', mini('sine')),
  fn('gain', 0.4),
)

export const bass = chain(bassPart, fn('cpm', 30))
