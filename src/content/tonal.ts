import { chain, fn, patternCallback, pitch, rest, sample, sequence, stack } from 'react-strudel-kit'
import type { PatternModifierCall } from 'react-strudel-kit'
import { KICK, KICK_DEFAULTS, NOISE, HI_HAT_DEFAULTS, hiHatSound, kickSound } from './drums'

// Sound Cookbook tonal sounds. Like the drums, each sound is a list of modifiers;
// the notes and rhythm that play it are written separately.

// #region chords
// The C–Am–F–G progression used across the harmony examples.
// stack() inside a note pattern plays its notes at the same time: a chord.
export const CHORDS = {
  C: stack(pitch('c4'), pitch('e4'), pitch('g4')),
  Am: stack(pitch('c4'), pitch('e4'), pitch('a4')),
  F: stack(pitch('c4'), pitch('f4'), pitch('a4')),
  G: stack(pitch('b3'), pitch('d4'), pitch('g4')),
}
// #endregion

export type BassSettings = { cutoff: number, decay: number, sustain: number }
export const BASS_DEFAULTS: BassSettings = { cutoff: 600, decay: 0.2, sustain: 0.3 }

// #region bass-sound
export const bassSound = (sound: BassSettings): PatternModifierCall[] => [
  fn('instrument', sample('sawtooth')), // Rich in overtones, so the filter has work to do.
  fn('lowPass', sound.cutoff), // Remove everything above this (Hz): lower is rounder.
  fn('attack', 0.005),
  fn('decay', sound.decay), // Seconds to fall from the peak to the sustain level.
  fn('sustain', sound.sustain), // Level held while the note lasts: 0 = pluck, 1 = organ.
  fn('release', 0.05),
  fn('gain', 0.3),
]
// #endregion

// #region bass-alone
export const bassAlone = (settings: BassSettings) => chain(
  // Eight slots: root, rest, root, fifth, rest, root, octave, fifth.
  fn('note', sequence(
    pitch('c2'), rest(), pitch('c2'), pitch('g2'),
    rest(), pitch('c2'), pitch('c3'), pitch('g2'),
  )),
  ...bassSound(settings),
  fn('cpm', 25), // 100 BPM.
)
// #endregion

export type KeysSettings = { brightness: number, decay: number, room: number }
export const KEYS_DEFAULTS: KeysSettings = { brightness: 2500, decay: 0.25, room: 0.25 }

// #region keys-sound
export const keysSound = (sound: KeysSettings): PatternModifierCall[] => [
  fn('instrument', sample('square')), // Hollow and woody, like an electric organ.
  fn('lowPass', sound.brightness), // Higher lets more of the square wave's edge through.
  fn('attack', 0.002),
  fn('decay', sound.decay),
  fn('sustain', 0), // Every note fades on its own, like a struck key.
  fn('release', 0.1),
  fn('room', sound.room), // Reverb: 0 is dry, higher sounds farther away.
  fn('gain', 0.14),
]
// #endregion

// #region keys-alone
export const keysAlone = (settings: KeysSettings) => chain(
  fn('cat', fn('note', CHORDS.C), fn('note', CHORDS.Am)), // One chord per bar.
  ...keysSound(settings),
  fn('cpm', 25),
)
// #endregion

export type LeadSettings = { cutoff: number, length: number, echo: number }
export const LEAD_DEFAULTS: LeadSettings = { cutoff: 3000, length: 0.8, echo: 0.35 }

// #region lead-sound
export const leadSound = (sound: LeadSettings): PatternModifierCall[] => [
  fn('instrument', sample('sawtooth')), // Bright and buzzy: cuts through a mix.
  fn('lowPass', sound.cutoff),
  fn('attack', 0.01),
  fn('decay', 0.1),
  fn('sustain', 0.6),
  fn('release', 0.08),
  fn('clip', sound.length), // Note length as a share of its slot: 1 = legato.
  fn('gain', 0.16),
  // off() layers a copy shifted by 1/8 of a cycle (half a beat) — an echo.
  // The callback changes only the copy: here, how hard it is struck.
  fn('off', 0.125, patternCallback(fn('velocity', sound.echo))),
]
// #endregion

// #region lead-alone
export const leadAlone = (settings: LeadSettings) => chain(
  fn('note', sequence(
    pitch('a4'), pitch('c5'), pitch('e5'), pitch('d5'),
    pitch('c5'), pitch('a4'), pitch('g4'), rest(),
  )),
  ...leadSound(settings),
  fn('cpm', 25),
)
// #endregion

export type PadSettings = { attack: number, release: number, room: number }
export const PAD_DEFAULTS: PadSettings = { attack: 0.6, release: 1.2, room: 0.5 }

// #region pad-sound
export const padSound = (sound: PadSettings): PatternModifierCall[] => [
  fn('instrument', sample('sawtooth')),
  fn('lowPass', 1200), // A low cutoff keeps the sawtooth soft.
  fn('attack', sound.attack), // Seconds to fade in: slow attacks swell.
  fn('sustain', 1), // Hold full level for the whole chord.
  fn('release', sound.release), // Seconds to fade out after the chord ends.
  fn('room', sound.room),
  fn('size', 0.8), // A large room for a long reverb tail.
  fn('gain', 0.08), // Three notes at once: keep each one quiet.
]
// #endregion

// #region pad-alone
export const padAlone = (settings: PadSettings) => chain(
  fn('cat', fn('note', CHORDS.C), fn('note', CHORDS.Am), fn('note', CHORDS.F), fn('note', CHORDS.G)),
  ...padSound(settings),
  fn('cpm', 25),
)
// #endregion

// #region bass-groove
export const bassGroove = (settings: BassSettings) => chain(
  fn('stack',
    chain(fn('note', sequence(KICK, rest(), KICK, rest())), ...kickSound(KICK_DEFAULTS)),
    chain(fn('note', sequence(pitch('c2'), rest(), pitch('c2'), pitch('g2'), rest(), pitch('c2'), pitch('c3'), pitch('g2'))), ...bassSound(settings)),
  ),
  fn('cpm', 25),
)
// #endregion

// #region keys-groove
export const keysGroove = (settings: KeysSettings) => chain(
  fn('stack',
    // Each chord struck on beats 2 and 4 instead of held: a "comp".
    chain(fn('cat',
      fn('note', sequence(rest(), CHORDS.C, rest(), CHORDS.C)),
      fn('note', sequence(rest(), CHORDS.Am, rest(), CHORDS.Am)),
    ), ...keysSound(settings)),
    chain(fn('cat', fn('note', pitch('c2')), fn('note', pitch('a1'))), ...bassSound(BASS_DEFAULTS)),
  ),
  fn('cpm', 25),
)
// #endregion

// #region lead-groove
export const leadGroove = (settings: LeadSettings) => chain(
  fn('stack',
    chain(fn('note', sequence(
      pitch('a4'), pitch('c5'), pitch('e5'), pitch('d5'),
      pitch('c5'), pitch('a4'), pitch('g4'), rest(),
    )), ...leadSound(settings)),
    chain(fn('note', CHORDS.Am), ...padSound(PAD_DEFAULTS)), // A held chord underneath.
  ),
  fn('cpm', 25),
)
// #endregion

// #region pad-groove
export const padGroove = (settings: PadSettings) => chain(
  fn('stack',
    chain(fn('cat', fn('note', CHORDS.C), fn('note', CHORDS.Am), fn('note', CHORDS.F), fn('note', CHORDS.G)), ...padSound(settings)),
    chain(fn('note', sequence(KICK, KICK, KICK, KICK)), ...kickSound(KICK_DEFAULTS)),
    chain(fn('sample', sequence(rest(), NOISE, rest(), NOISE, rest(), NOISE, rest(), NOISE)), ...hiHatSound(HI_HAT_DEFAULTS)),
  ),
  fn('cpm', 25),
)
// #endregion
