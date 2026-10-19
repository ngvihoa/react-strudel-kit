import { WAVEFORMS } from '../mixer'
import type { ArrangementPart, TrackMix, Waveform } from '../mixer'

type Props = {
  part: ArrangementPart
  mix: TrackMix
  audible: boolean
  onChange: (change: Partial<TrackMix>) => void
}

export function TrackControls({ part, mix, audible, onChange }: Props) {
  return (
    <div className={`track-row${audible ? '' : ' track-quiet'}`}>
      <div className="track-name">
        <h3>{part.label}</h3>
        <p>{part.description}</p>
      </div>
      <div className="track-switches">
        <button type="button" aria-label={`Mute ${part.label}`} aria-pressed={mix.muted}
          onClick={() => onChange({ muted: !mix.muted, ...(!mix.muted ? { solo: false } : {}) })}>Mute</button>
        <button type="button" aria-label={`Solo ${part.label}`} aria-pressed={mix.solo}
          onClick={() => onChange({ solo: !mix.solo, ...(!mix.solo ? { muted: false } : {}) })}>Solo</button>
      </div>
      <div className="track-volume range-control">
        <label htmlFor={`${part.id}-volume`}>Volume <output htmlFor={`${part.id}-volume`}>{mix.volume}%</output></label>
        <input id={`${part.id}-volume`} type="range" min="0" max="100" step="1"
          aria-label={`${part.label} volume`} aria-valuetext={`${mix.volume} percent`}
          value={mix.volume} onChange={(event) => onChange({ volume: Number(event.target.value) })} />
      </div>
      <div className="track-sound">
        {mix.instrument ? <>
          <label htmlFor={`${part.id}-sound`}>Sound</label>
          <select id={`${part.id}-sound`} aria-label={`${part.label} sound`} value={mix.instrument}
            onChange={(event) => onChange({ instrument: event.target.value as Waveform })}>
            {WAVEFORMS.map((sound) => <option key={sound} value={sound}>{sound[0].toUpperCase() + sound.slice(1)}</option>)}
          </select>
        </> : <span className="fixed-sound">{part.id === 'kick' ? 'Synth kick' : 'Noise percussion'}</span>}
      </div>
    </div>
  )
}
