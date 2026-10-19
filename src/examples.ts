import { melodyPart } from './patterns/melody'
import { bassPart } from './patterns/bass'
import { LAYER_PARTS } from './patterns/layers'
import { DANCE_MONKEY_PARTS } from './songs/danceMonkey'
import type { Arrangement } from './mixer'

export const DANCE_MONKEY: Arrangement = {
  id: 'dance-monkey', name: 'Dance Monkey', key: 'F# minor', bpm: 98, bars: 8,
  description: 'Tones and I · Instrumental chorus',
  parts: [
    { id: 'melody', label: 'Melody', description: 'The chorus hook', pattern: DANCE_MONKEY_PARTS.melody, instrument: 'triangle' },
    { id: 'bass', label: 'Bass', description: 'Low-end pulse', pattern: DANCE_MONKEY_PARTS.bass, instrument: 'sine' },
    { id: 'keys', label: 'Keys', description: 'Broken-chord backing', pattern: DANCE_MONKEY_PARTS.keys, instrument: 'triangle' },
    { id: 'kick', label: 'Kick', description: 'Four beats to the bar', pattern: DANCE_MONKEY_PARTS.kick },
    { id: 'snare', label: 'Snare', description: 'The backbeat', pattern: DANCE_MONKEY_PARTS.snare },
    { id: 'hats', label: 'Hi-hat', description: 'Eighth-note texture', pattern: DANCE_MONKEY_PARTS.hats },
  ],
}

export const PLAYGROUND_EXAMPLES: readonly Arrangement[] = [
  DANCE_MONKEY,
  {
    id: 'melody', name: 'Simple melody', key: 'C major', bpm: 120, bars: 1,
    description: 'Four notes · A simple starting point',
    parts: [{ id: 'melody', label: 'Melody', description: 'Four notes per bar', pattern: melodyPart, instrument: 'triangle' }],
  },
  {
    id: 'bass', name: 'Bass line', key: 'C major', bpm: 120, bars: 4,
    description: 'Four roots · A slow-moving bass line',
    parts: [{ id: 'bass', label: 'Bass', description: 'A different root each bar', pattern: bassPart, instrument: 'sine' }],
  },
  {
    id: 'layers', name: 'Melody & bass', key: 'C major', bpm: 120, bars: 4,
    description: 'Two parts · Find your own balance',
    parts: [
      { id: 'melody', label: 'Melody', description: 'The top line', pattern: LAYER_PARTS.melody, instrument: 'triangle' },
      { id: 'bass', label: 'Bass', description: 'The foundation', pattern: LAYER_PARTS.bass, instrument: 'sine' },
    ],
  },
]

// The optional code editor keeps an independent locally saved draft.
export const DEFAULT_CODE = `setcpm(30)
note("c4 e4 g4 b4")
  .s("triangle")
  .gain(0.3)`
