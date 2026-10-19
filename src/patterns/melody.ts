import { chain, fn, mini } from 'react-strudel-kit'

export const melodyPart = chain(
  fn('note', mini('c4 e4 g4 b4')),
  fn('instrument', mini('triangle')),
  fn('gain', 0.3),
)

export const melody = chain(melodyPart, fn('cpm', 30))
