'use client'

import { chain, fn, pitch, sample, sequence } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

const firstPattern = chain(
  fn('note', sequence(pitch('c4'), pitch('e4'), pitch('g4'), pitch('b4'))),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
  fn('cpm', 30),
)

export function GettingStarted() {
  const { play, stop, status, error } = useStrudel()

  return (
    <div role="group" aria-label="First pattern player">
      <button type="button" className="play-button"
        onClick={() => void play(firstPattern)}>Play</button>
      <button type="button" className="stop-button" onClick={stop}>Stop</button>
      <output aria-live="polite">{status}</output>
      {error && <p role="alert">{error.message}</p>}
    </div>
  )
}
