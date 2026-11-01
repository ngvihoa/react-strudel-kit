import { chain, fn, number, pitch, repeat, rest, sample, sequence } from 'react-strudel-kit'
import type { PatternModifierCall } from 'react-strudel-kit'

// Sound Cookbook drums. Each sound is a list of modifiers: HOW it sounds.
// Rhythm, WHEN it plays, is written separately, so one kick can play any beat.
// The examples import these sounds and write their own rhythms.

// #region sources
export const KICK = pitch('c2') // A kick strike is a low C, bent by its pitch envelope.
export const NOISE = sample('white') // Snare and hi-hat both start from white noise.
// #endregion

export type KickSettings = { pitchDrop: number, pitchTime: number, decay: number }
export const KICK_DEFAULTS: KickSettings = { pitchDrop: 24, pitchTime: 0.04, decay: 0.13 }

// #region kick-sound
export const kickSound = (sound: KickSettings): PatternModifierCall[] => [
  fn('instrument', sample('sine')), // A pure, low tone.
  fn('pitchEnvelope', sound.pitchDrop), // Start this many semitones above C2…
  fn('pitchDecay', sound.pitchTime), // …and fall back this fast (s): the thump.
  fn('decay', sound.decay), // Loudness fades on its own timeline (seconds).
  fn('sustain', 0),
  fn('release', 0.03),
  fn('gain', 0.75),
]
// #endregion

// #region kick-alone
export const kickAlone = (settings: KickSettings) => chain(
  fn('note', repeat(KICK, 4)), // Four strikes per bar.
  ...kickSound(settings),
  fn('cpm', 25), // 100 BPM.
)
// #endregion

export type SnareSettings = { lowCut: number, highCut: number, decay: number }
export const SNARE_DEFAULTS: SnareSettings = { lowCut: 1200, highCut: 8000, decay: 0.09 }

// #region snare-sound
export const snareSound = (sound: SnareSettings): PatternModifierCall[] => [
  fn('highPass', sound.lowCut), // Cut noise below this (Hz): less rumble.
  fn('lowPass', sound.highCut), // Cut noise above this (Hz): less hiss.
  fn('decay', sound.decay), // A short burst, not a hiss.
  fn('sustain', 0),
  fn('release', 0.03),
  fn('gain', 0.16),
]
// #endregion

// #region snare-alone
export const snareAlone = (settings: SnareSettings) => chain(
  fn('sample', sequence(rest(), NOISE, rest(), NOISE)), // Beats 2 and 4.
  ...snareSound(settings),
  fn('cpm', 25),
)
// #endregion

export type HiHatSettings = { lowCut: number, decay: number, offBeat: number }
export const HI_HAT_DEFAULTS: HiHatSettings = { lowCut: 7000, decay: 0.025, offBeat: 0.5 }

// #region hi-hat-sound
export const hiHatSound = (sound: HiHatSettings): PatternModifierCall[] => [
  fn('highPass', sound.lowCut), // Keep only the brightest part of the noise.
  fn('decay', sound.decay), // Much shorter than the snare: a tick, not a burst.
  fn('sustain', 0),
  fn('release', 0.01),
  fn('gain', 0.08),
]
// #endregion

// #region hi-hat-alone
export const hiHatAlone = (settings: HiHatSettings) => chain(
  fn('sample', repeat(NOISE, 8)), // Eight strikes per bar.
  ...hiHatSound(settings),
  // velocity scales each strike: full on the beat, softer in between.
  fn('velocity', repeat(sequence(number(1), number(settings.offBeat)), 4)),
  fn('cpm', 25),
)
// #endregion

// #region kick-groove
export const kickGroove = (settings: KickSettings) => chain(
  fn('stack',
    chain(fn('note', repeat(KICK, 4)), ...kickSound(settings)),
    chain(fn('sample', repeat(NOISE, 8)), ...hiHatSound(HI_HAT_DEFAULTS)),
  ),
  fn('cpm', 25),
)
// #endregion

// #region snare-groove
export const snareGroove = (settings: SnareSettings) => chain(
  fn('stack',
    // Kick on beats 1 and 3, snare on 2 and 4.
    chain(fn('note', sequence(KICK, rest(), KICK, rest())), ...kickSound(KICK_DEFAULTS)),
    chain(fn('sample', sequence(rest(), NOISE, rest(), NOISE)), ...snareSound(settings)),
  ),
  fn('cpm', 25),
)
// #endregion

// #region hi-hat-groove
export const hiHatGroove = (settings: HiHatSettings) => chain(
  fn('stack',
    chain(fn('note', sequence(KICK, rest(), KICK, rest())), ...kickSound(KICK_DEFAULTS)),
    chain(fn('sample', sequence(rest(), NOISE, rest(), NOISE)), ...snareSound(SNARE_DEFAULTS)),
    chain(
      fn('sample', repeat(NOISE, 8)),
      ...hiHatSound(settings),
      fn('velocity', repeat(sequence(number(1), number(settings.offBeat)), 4)),
    ),
  ),
  fn('cpm', 25),
)
// #endregion
