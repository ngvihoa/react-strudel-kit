import { chain, fn, pitch, repeat, sample } from 'react-strudel-kit'
import type { PatternExpression } from 'react-strudel-kit'

export type KickSettings = {
  /** How far above the base note the strike starts, in semitones. */
  pitchDrop: number
  /** How long the pitch takes to fall back to the base note, in seconds. */
  pitchTime: number
  /** How long the loudness takes to fade, in seconds. */
  decay: number
}

export const KICK_DEFAULTS: KickSettings = { pitchDrop: 24, pitchTime: 0.04, decay: 0.13 }

// #region kick
export const kick = ({ pitchDrop, pitchTime, decay }: KickSettings) => chain(
  fn('note', repeat(pitch('c2'), 4)), // Four strikes per bar: one per beat.
  fn('instrument', sample('sine')), // A pure, low tone.
  fn('pitchEnvelope', pitchDrop), // Start higher than C2...
  fn('pitchDecay', pitchTime), // ...and fall back quickly: the "thump".
  fn('decay', decay), // Loudness fades on its own timeline.
  fn('sustain', 0),
  fn('release', 0.03),
  fn('gain', 0.75),
)
// #endregion

// #region groove
export const groove = (settings: KickSettings) => fn('stack',
  kick(settings),
  chain(
    fn('sample', repeat(sample('white'), 8)), // Eighth-note hi-hats.
    fn('highPass', 7000),
    fn('decay', 0.025),
    fn('sustain', 0),
    fn('gain', 0.07),
  ),
)
// #endregion

/** At 100 BPM, four beats per bar means 25 cycles per minute. */
export const withTempo = (pattern: PatternExpression) => chain(pattern, fn('cpm', 25))
