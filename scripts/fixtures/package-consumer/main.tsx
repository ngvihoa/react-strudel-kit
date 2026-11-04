import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { chain, fn, pitch, sample, toStrudelCode } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

const makeTone = (note: 'c4' | 'g4') => chain(
  fn('note', pitch(note)),
  fn('instrument', sample('sine')),
  fn('gain', 0.1),
  fn('decay', 0.05),
  fn('sustain', 0),
  fn('cpm', 240),
)
const low = makeTone('c4')
const high = makeTone('g4')

export function Player() {
  const { play, update, stop, status, error } = useStrudel()
  const [updates, setUpdates] = useState(0)

  return (
    <>
      <button onClick={() => void play(low)}>Play</button>
      <button onClick={async () => { await update(high); setUpdates(value => value + 1) }}>Update</button>
      <button onClick={stop}>Stop</button>
      <output aria-label="Playback">{status}</output>
      <output aria-label="Update">{updates}</output>
      {error && <p role="alert">{error.message}</p>}
    </>
  )
}

export function App() {
  const [mounted, setMounted] = useState(true)
  return (
    <>
      <pre>{toStrudelCode(low)}</pre>
      {mounted ? <Player /> : <p>Unmounted</p>}
      <button onClick={() => setMounted(false)}>Unmount player</button>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
