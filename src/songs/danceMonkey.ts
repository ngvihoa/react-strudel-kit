import { chain, fn, number, pitch, repeat, rest, sample, sequence, weight } from 'react-strudel-kit'

export const DANCE_MONKEY_BPM = 98

// This example spells out the melody with the kit's note/rhythm builders.
// A bar has 4 beats. We count each beat as 4 sixteenth-note units: 16 per bar.
//
//   pitch('a4')            one unit: a sixteenth note
//   weight(pitch('a4'), 2) two units TOTAL: an eighth note, not two strikes
//   weight(pitch('a4'), 3) three units: a dotted eighth note
//   weight(pitch('a4'), 4) four units: a quarter note (one beat)
//   rest()                one unit of silence
//   weight(rest(), 4)     four units of silence (one beat)
//
// weight() sets a relative share of a sequence, not an absolute duration.
// These shares represent sixteenths here because EVERY bar below totals 16.
// sequence() plays its entries in order; fn('cat', ...) plays one bar per cycle.
// The bars are intentionally written out, including repeated phrases, so a
// reader can follow the score from left to right without decoding notation.
// Melody reference: Popwise teaching score, transposed to F# minor.
// See docs/dance-monkey.md for a walkthrough and musical references.
export const DANCE_MONKEY_MELODY_BARS = [
  // Bar 1: four beats, with each beat's units shown separately.
  sequence(
    // Beat 1: 2 + 1 + 1 = 4 units. Hold A, then strike A twice more.
    weight(pitch('a4'), 2),
    pitch('a4'),
    pitch('a4'),

    // Beat 2: 2 + 1 + 1 = 4 units, now on G#.
    weight(pitch('g#4'), 2),
    pitch('g#4'),
    pitch('g#4'),

    // Beat 3: 2 + 1 + 1 = 4 units. G# steps down to two short F# notes.
    weight(pitch('g#4'), 2),
    pitch('f#4'),
    pitch('f#4'),

    // Beat 4: 3 + 1 = 4 units. A longer A followed by a short F#.
    weight(pitch('a4'), 3),
    pitch('f#4'),
  ),

  // Bar 2: a long pause, followed by a pickup into the next bar.
  sequence(
    weight(rest(), 11), // Silence for 11 units (2 beats + 3 sixteenths).
    pitch('f#4'),
    pitch('a4'),
    weight(pitch('a4'), 2),
    pitch('g#4'),
    // Total: 11 + 1 + 1 + 2 + 1 = 16 units.
  ),

  // Bar 3: short alternating notes, with a pause at the start and near the end.
  sequence(
    weight(rest(), 2),
    pitch('g#4'),
    pitch('f#4'),
    pitch('g#4'),
    pitch('f#4'),
    pitch('g#4'),
    pitch('f#4'),
    pitch('g#4'),
    pitch('f#4'),
    weight(rest(), 2),
    weight(pitch('a4'), 2),
    weight(pitch('g#4'), 2),
    // Total: 2 + eight short notes + 2 + 2 + 2 = 16 units.
  ),

  // Bar 4: two eighth notes, a one-beat rest, then two one-beat notes.
  sequence(
    weight(pitch('f#4'), 2),
    weight(pitch('a4'), 2),
    weight(rest(), 4),
    weight(pitch('f#4'), 4),
    weight(pitch('f#4'), 4),
    // Total: 2 + 2 + 4 + 4 + 4 = 16 units.
  ),

  // Bar 5 repeats bar 1. Written out so the second phrase is easy to follow.
  sequence(
    weight(pitch('a4'), 2),
    pitch('a4'),
    pitch('a4'),
    weight(pitch('g#4'), 2),
    pitch('g#4'),
    pitch('g#4'),
    weight(pitch('g#4'), 2),
    pitch('f#4'),
    pitch('f#4'),
    weight(pitch('a4'), 3),
    pitch('f#4'),
    // Total: (2 + 1 + 1) + (2 + 1 + 1) + (2 + 1 + 1) + (3 + 1) = 16.
  ),

  // Bar 6 repeats the pause and pickup from bar 2.
  sequence(
    weight(rest(), 11),
    pitch('f#4'),
    pitch('a4'),
    weight(pitch('a4'), 2),
    pitch('g#4'),
    // Total: 11 + 1 + 1 + 2 + 1 = 16 units.
  ),

  // Bar 7 varies bar 3: the F# and G# notes are held longer.
  sequence(
    weight(rest(), 2),
    weight(pitch('f#4'), 2),
    weight(pitch('g#4'), 2),
    weight(pitch('f#4'), 2),
    pitch('g#4'),
    weight(pitch('f#4'), 2),
    pitch('a4'),
    weight(rest(), 2),
    weight(pitch('g#4'), 2),
    // Total: 2 + 2 + 2 + 2 + 1 + 2 + 1 + 2 + 2 = 16 units.
  ),

  // Bar 8: two opening notes, two beats of silence, then a descending ending.
  sequence(
    weight(pitch('f#4'), 2),
    weight(pitch('a4'), 2),
    weight(rest(), 8),
    weight(pitch('f#4'), 2),
    weight(pitch('e4'), 2),
    // Total: 2 + 2 + 8 + 2 + 2 = 16 units.
  ),
] as const

// The note factory accepts these typed sequence nodes directly: no mini()
// conversion is needed. cat gives each bar one full cycle of the melody.
const melodySequence = fn('cat',
  fn('note', DANCE_MONKEY_MELODY_BARS[0]),
  fn('note', DANCE_MONKEY_MELODY_BARS[1]),
  fn('note', DANCE_MONKEY_MELODY_BARS[2]),
  fn('note', DANCE_MONKEY_MELODY_BARS[3]),
  fn('note', DANCE_MONKEY_MELODY_BARS[4]),
  fn('note', DANCE_MONKEY_MELODY_BARS[5]),
  fn('note', DANCE_MONKEY_MELODY_BARS[6]),
  fn('note', DANCE_MONKEY_MELODY_BARS[7]),
)
const melody = chain(
  melodySequence,
  fn('gain', 0.48),
  fn('lowPass', 3800), // Attenuate high frequencies above the filter's cutoff (Hz).
  fn('room', 0.12),
  fn('clip', 0.85), // Scale the note's duration; its next onset stays in place.
  fn('instrument', sample('triangle')), // Give the pitched notes a triangle-wave voice.
  fn('attack', 0.008), // Seconds to rise to full amplitude.
  fn('decay', 0.09), // Seconds to fall toward the sustain level.
  fn('sustain', 0.45), // Amplitude level while the note is held.
  fn('release', 0.06), // Seconds to fade out after the note is released.
)

// One cycle = one 4/4 bar. Bass and keys repeat their four-bar progression
// twice while the melody completes its eight-bar phrase.
//
// Unlike the melody's 16-unit grid, each bass bar has EIGHT equal slots:
// each pitch() or rest() below takes an eighth note (half a beat).
// Silence still occupies a slot; it does not pull the next note forward.
export const DANCE_MONKEY_BASS_BARS = [
  // Bar 1: F# minor. F# is the root; C# is its fifth.
  sequence(
    pitch('f#2'), // Beat 1: root, then silence.
    rest(),
    pitch('f#2'), // Beat 2: two root strikes.
    pitch('f#2'),
    rest(), // Beat 3: silence, then the fifth.
    pitch('c#3'),
    pitch('f#2'), // Beat 4: return to the root, then silence.
    rest(),
  ),
  // Bar 2: D major, with the same rhythm. Root D, fifth A.
  sequence(
    pitch('d2'),
    rest(),
    pitch('d2'),
    pitch('d2'),
    rest(),
    pitch('a2'),
    pitch('d2'),
    rest(),
  ),
  // Bar 3: E major. Root E, fifth B.
  sequence(
    pitch('e2'),
    rest(),
    pitch('e2'),
    pitch('e2'),
    rest(),
    pitch('b2'),
    pitch('e2'),
    rest(),
  ),
  // Bar 4: C# minor. Root C#, fifth G#.
  sequence(
    pitch('c#2'),
    rest(),
    pitch('c#2'),
    pitch('c#2'),
    rest(),
    pitch('g#2'),
    pitch('c#2'),
    rest(),
  ),
] as const

const bassSequence = fn('cat',
  fn('note', DANCE_MONKEY_BASS_BARS[0]),
  fn('note', DANCE_MONKEY_BASS_BARS[1]),
  fn('note', DANCE_MONKEY_BASS_BARS[2]),
  fn('note', DANCE_MONKEY_BASS_BARS[3]),
)
const bass = chain(
  bassSequence,
  fn('gain', 0.42),
  fn('lowPass', 650), // Keep the bass dark, below the melody.
  fn('clip', 0.65),
  fn('instrument', sample('sine')), // A sine wave gives a smooth low tone.
  fn('attack', 0.003),
  fn('decay', 0.09),
  fn('sustain', 0.3),
  fn('release', 0.04),
)

// Keys outline each chord as four successive notes, rather than a chord
// struck all at once. repeat(..., 2) plays that figure TWICE within one bar:
// four notes x two repetitions = eight eighth notes.
// repeat() strikes again; weight() would hold a single event longer.
export const DANCE_MONKEY_KEYS_BARS = [
  // Bar 1: F# minor (C#–F#–A–F#).
  repeat(sequence(
    pitch('c#4'),
    pitch('f#4'),
    pitch('a4'),
    pitch('f#4'),
  ), 2),
  // Bar 2: D major (D–F#–A–F#).
  repeat(sequence(
    pitch('d4'),
    pitch('f#4'),
    pitch('a4'),
    pitch('f#4'),
  ), 2),
  // Bar 3: E major (E–G#–B–G#).
  repeat(sequence(
    pitch('e4'),
    pitch('g#4'),
    pitch('b4'),
    pitch('g#4'),
  ), 2),
  // Bar 4: C# minor (C#–E–G#–E).
  repeat(sequence(
    pitch('c#4'),
    pitch('e4'),
    pitch('g#4'),
    pitch('e4'),
  ), 2),
] as const

const keysSequence = fn('cat',
  fn('note', DANCE_MONKEY_KEYS_BARS[0]),
  fn('note', DANCE_MONKEY_KEYS_BARS[1]),
  fn('note', DANCE_MONKEY_KEYS_BARS[2]),
  fn('note', DANCE_MONKEY_KEYS_BARS[3]),
)
const keys = chain(
  keysSequence,
  fn('gain', 0.14), // Quieter than the lead melody.
  fn('lowPass', 2200),
  fn('pan', 0.35), // Pan runs from 0 (left) to 1 (right); 0.5 is center.
  fn('room', 0.18),
  fn('clip', 0.6),
  fn('instrument', sample('triangle')),
  fn('attack', 0.002),
  fn('decay', 0.12),
  fn('sustain', 0), // Fade down to silence for a plucked sound.
  fn('release', 0.06),
)

// Four evenly spaced C2 strikes per bar: one kick on each quarter-note beat.
// The sine oscillator and falling pitch make a synthesized kick drum.
const kick = chain(
  fn('note', repeat(pitch('c2'), 4)),
  fn('gain', 0.75),
  fn('instrument', sample('sine')),
  fn('pitchEnvelope', 24), // Start above the base pitch, then fall toward C2.
  fn('pitchDecay', 0.04), // Make that pitch drop quick (seconds).
  fn('decay', 0.13), // The amplitude fades separately from the pitch.
  fn('sustain', 0),
  fn('release', 0.03),
)

// Four equal slots = four beats. White noise strikes on beats 2 and 4.
// sample('white') is a sound token; fn('sample', ...) turns the sequence
// of sound tokens and rests into a playable pattern. No note pitch is needed.
const snare = chain(
  fn('sample', sequence(
    rest(), // Beat 1.
    sample('white'), // Beat 2.
    rest(), // Beat 3.
    sample('white'), // Beat 4.
  )),
  fn('gain', 0.16),
  fn('highPass', 1200), // Cut low frequencies out of the noise.
  fn('lowPass', 8000), // Soften its highest frequencies.
  fn('decay', 0.09),
  fn('sustain', 0),
  fn('release', 0.03),
)

// Eight noise strikes per bar = eighth-note hi-hats. The higher filter cutoff
// and much shorter decay distinguish them from the snare's longer noise hit.
const hats = chain(
  fn('sample', repeat(sample('white'), 8)),
  // This control has TWO equal slots over the WHOLE bar, independently of
  // the eight strikes: first four hats softer, last four hats louder.
  fn('gain', sequence(
    number(0.055), // Beats 1–2.
    number(0.09), // Beats 3–4.
  )),
  fn('highPass', 7000),
  fn('pan', 0.65), // Slightly right, opposite the keys.
  fn('decay', 0.025),
  fn('sustain', 0),
  fn('release', 0.01),
)

export const DANCE_MONKEY_PARTS = { melody, bass, keys, kick, snare, hats } as const

export const DANCE_MONKEY_MIX = chain(
  fn('stack', melody, bass, keys, kick, snare, hats),
  fn('postGain', 0.8),
)

// A complete kit value: pass this object to useStrudel().play().
// Four beats per cycle means 98 BPM / 4 = 24.5 cycles per minute.
export const DANCE_MONKEY_PATTERN = chain(
  DANCE_MONKEY_MIX,
  fn('cpm', DANCE_MONKEY_BPM / 4),
)
