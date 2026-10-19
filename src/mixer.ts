import { chain, fn, mini } from 'react-strudel-kit'
import type { PatternExpression } from 'react-strudel-kit'

export const WAVEFORMS = ['triangle', 'sine', 'square', 'sawtooth'] as const
export type Waveform = typeof WAVEFORMS[number]

export type ArrangementPart = {
  id: string
  label: string
  description: string
  pattern: PatternExpression
  instrument?: Waveform
}

export type Arrangement = {
  id: string
  name: string
  description: string
  key: string
  bpm: number
  bars: number
  parts: readonly ArrangementPart[]
}

export type TrackMix = {
  volume: number
  muted: boolean
  solo: boolean
  instrument?: Waveform
}

export type MixSettings = {
  bpm: number
  volume: number
  tracks: Record<string, TrackMix>
}

export const createMixSettings = (arrangement: Arrangement): MixSettings => ({
  bpm: arrangement.bpm,
  volume: 80,
  tracks: Object.fromEntries(arrangement.parts.map((part) => [part.id, {
    volume: 100, muted: false, solo: false, instrument: part.instrument,
  }])),
})

export const audibleParts = (arrangement: Arrangement, mix: MixSettings) => {
  const soloing = arrangement.parts.some((part) => mix.tracks[part.id].solo)
  return arrangement.parts.filter((part) => {
    const track = mix.tracks[part.id]
    return !track.muted && track.volume > 0 && (!soloing || track.solo)
  })
}

/** React control values become a typed pattern, consumed by play()/update(). */
export const buildMix = (arrangement: Arrangement, mix: MixSettings): PatternExpression => {
  const parts = audibleParts(arrangement, mix).map((part) => {
    const track = mix.tracks[part.id]
    let pattern = chain(part.pattern, fn('velocity', track.volume / 100))
    if (track.instrument) pattern = chain(pattern, fn('instrument', mini(track.instrument)))
    return pattern
  })
  const combined = parts[0] ? fn('stack', parts[0], ...parts.slice(1)) : fn('silence')
  return chain(combined, fn('postGain', mix.volume / 100), fn('cpm', mix.bpm / 4))
}
