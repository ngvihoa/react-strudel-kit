import { useState } from 'react'
import { chain, fn } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'
import { LAYERS } from './layerASong'

// #region state
type Part = keyof typeof LAYERS
type Mix = { bpm: number, muted: Record<Part, boolean> }

const PARTS = Object.keys(LAYERS) as Part[]
const INITIAL: Mix = { bpm: 100, muted: { drums: false, bass: false, chords: false, melody: false } }
// #endregion

// #region build
// React state in, typed pattern out. A plain function: easy to test, no audio.
const buildPattern = ({ bpm, muted }: Mix) => {
  const parts = PARTS.filter((part) => !muted[part]).map((part) => LAYERS[part])
  const mix = parts.length > 0 ? fn('stack', parts[0], ...parts.slice(1)) : fn('silence')
  return chain(mix, fn('cpm', bpm / 4))
}
// #endregion

// #region component
export function ReactMixer() {
  const { play, update, stop, status, error } = useStrudel()
  const [mix, setMix] = useState(INITIAL)

  // Every change rebuilds the pattern. While music plays, update() swaps it in
  // without restarting; while stopped, nothing plays until the next Play.
  const change = (next: Mix) => {
    setMix(next)
    if (status === 'playing') void update(buildPattern(next))
  }

  return (
    <div className="react-mixer">
      <div className="react-mixer-buttons">
        <button className="play-button" onClick={() => void play(buildPattern(mix))}>Play</button>
        <button className="stop-button" onClick={stop}>Stop</button>
        <output>{status}</output>
      </div>
      <label>
        Tempo: {mix.bpm} BPM
        <input type="range" min={70} max={140} value={mix.bpm}
          onChange={(event) => change({ ...mix, bpm: Number(event.target.value) })} />
      </label>
      <div className="react-mixer-parts">
        {PARTS.map((part) => (
          <label key={part}>
            <input type="checkbox" checked={!mix.muted[part]}
              onChange={() => change({ ...mix, muted: { ...mix.muted, [part]: !mix.muted[part] } })} />
            {part}
          </label>
        ))}
      </div>
      {error && <p role="alert">{error.message}</p>}
    </div>
  )
}
// #endregion
