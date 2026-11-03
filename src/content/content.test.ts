import { describe, expect, it } from 'vitest'
import { m } from '@strudel/web/dist/index.mjs'
import { toStrudelCode } from 'react-strudel-kit'
import type { PatternExpression } from 'react-strudel-kit'
import { FIRST_SONG_STEPS } from './firstSong'
import { busierKick, kickOneThree, snareTwoFour } from './examples/backbeat'
import { offBeatHats, offBeatHatsRepeat } from './examples/fourOnTheFloor'
import { accentedHats, swellingHats } from './examples/hiHatAccents'
import { twinkle, twinkleDetached } from './examples/simpleMelody'
import { walkingRoots } from './examples/bassLine'
import { jazzyChords, swungHats } from './examples/lofi'
import { offBeatBass } from './examples/house'
import { CHORDS } from './tonal'
import { toMiniNotation } from 'react-strudel-kit'
import { makeBeat } from './lessons/makeBeat'

// Page text makes timing claims; check them with Strudel's real pattern engine (no audio).
const mini = (pattern: PatternExpression, call: string) => {
  const found = toStrudelCode(pattern).match(new RegExp(`(?:^|\\.)${call}\\("([^"]*)"\\)`))
  if (!found) throw new Error(`No ${call}("…") in ${toStrudelCode(pattern)}`)
  return found[1]
}
type Hap = { value: unknown, whole: { begin: unknown, end: unknown }, hasOnset: () => boolean }
type Event = { value: string, start: number, end: number }
const timeline = (code: string, cycles = 1): Event[] => (m(code).queryArc(0, cycles) as Hap[])
  .filter((hap) => hap.hasOnset())
  .map((hap) => ({ value: String(hap.value), start: Number(hap.whole.begin), end: Number(hap.whole.end) }))
  .sort((a, b) => a.start - b.start)
// cat(note("…"), note("…")) plays one argument per cycle, like Mini-Notation's <[…] […]>.
const catOfNotes = (pattern: PatternExpression) =>
  `<${[...toStrudelCode(pattern).matchAll(/note\("([^"]*)"\)/g)].map((match) => `[${match[1]}]`).join(' ')}>`
const onsets = (code: string, cycles = 1) => timeline(code, cycles).map((event) => event.start)

describe('timing claims made on the learning pages', () => {
  it('alternates beat and off-beat hi-hat levels in the beat lesson', () => {
    const levels = timeline(mini(makeBeat(100, 0.25), 'velocity'))
    expect(levels.map((event) => Number(event.value))).toEqual([1, 0.25, 1, 0.25, 1, 0.25, 1, 0.25])
    expect(levels.map((event) => event.start)).toEqual([0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875])
  })
  it('weight holds one C for half the bar; repeat strikes two Cs in the same half', () => {
    expect(timeline(mini(FIRST_SONG_STEPS.held, 'note'))[0]).toEqual({ value: 'c4', start: 0, end: 0.5 })
    expect(timeline(mini(FIRST_SONG_STEPS.repeated, 'note')).slice(0, 2)).toEqual([
      { value: 'c4', start: 0, end: 0.25 },
      { value: 'c4', start: 0.25, end: 0.5 },
    ])
  })

  it('writes the off-beat hi-hats two ways with identical timing', () => {
    const long = timeline(mini(offBeatHats, 's'))
    expect(long.map((event) => event.start)).toEqual([0.125, 0.375, 0.625, 0.875])
    expect(timeline(mini(offBeatHatsRepeat, 's'))).toEqual(long)
  })

  it('puts kick on 1 and 3, snare on 2 and 4, and the busier kick half a beat after 3', () => {
    expect(onsets(mini(kickOneThree, 'note'))).toEqual([0, 0.5])
    expect(onsets(mini(snareTwoFour, 's'))).toEqual([0.25, 0.75])
    expect(onsets(mini(busierKick, 'note'))).toEqual([0, 0.5, 0.625])
  })

  it('accents every beat with an eight-slot velocity pattern', () => {
    expect(timeline(mini(accentedHats, 'velocity')).map((event) => Number(event.value)))
      .toEqual([1, 0.45, 1, 0.45, 1, 0.45, 1, 0.45])
  })

  it('swells with four velocity values, each lasting one beat (two strikes)', () => {
    expect(timeline(mini(swellingHats, 'velocity'))).toEqual([
      { value: '0.3', start: 0, end: 0.25 },
      { value: '0.55', start: 0.25, end: 0.5 },
      { value: '0.8', start: 0.5, end: 0.75 },
      { value: '1', start: 0.75, end: 1 },
    ])
  })

  it('plays Twinkle one bar per cycle; the detached version keeps every bar start in place', () => {
    const held = timeline(catOfNotes(twinkle), 4)
    const detached = timeline(catOfNotes(twinkleDetached), 4)
    expect(held.filter((event) => Number.isInteger(event.start)).map((event) => event.value)).toEqual(['c4', 'a4', 'f4', 'd4'])
    expect(detached.filter((event) => Number.isInteger(event.start)).map((event) => event.value)).toEqual(['c4', 'a4', 'f4', 'd4'])
    // Bar 2's G: held for two beats, or one beat followed by a rest.
    expect(held.find((event) => event.value === 'g4' && event.start >= 1)).toMatchObject({ start: 1.5, end: 2 })
    expect(detached.find((event) => event.value === 'g4' && event.start >= 1)).toMatchObject({ start: 1.5, end: 1.75 })
  })

  it('swings the lo-fi hi-hats: every second eighth lands two thirds into its beat', () => {
    const swung = (m(mini(swungHats, 's')) as unknown as { swingBy: (x: number, n: number) => ReturnType<typeof m> }).swingBy(1 / 3, 4)
    const starts = (swung.queryArc(0, 1) as Hap[]).filter((hap) => hap.hasOnset()).map((hap) => Number(hap.whole.begin)).sort((a, b) => a - b)
    expect(starts.map((start) => Math.round(start * 24))).toEqual([0, 4, 6, 10, 12, 16, 18, 22]) // 24ths of a bar.
  })

  it('keeps the house bass off the beat', () => {
    const bar = timeline(`<${[...toStrudelCode(offBeatBass).matchAll(/note\("([^"]*)"\)/g)].map((match) => `[${match[1]}]`).join(' ')}>`)
    expect(bar.map((event) => event.start)).toEqual([0.125, 0.375, 0.625, 0.875])
  })
})

// Text on the harmony pages names chords and intervals; check the notes match.
const SEMITONES: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }
const midi = (name: string) => {
  const [, letter, accidental, octave] = name.match(/^([a-g])(#|b)?(-?\d)$/)!
  return 12 * (Number(octave) + 1) + SEMITONES[letter] + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0)
}
const pitchClasses = (notation: string) => new Set(notation.split(/[\s,[\]]+/).filter(Boolean).map((name) => name[0]))

describe('harmony claims made on the learning pages', () => {
  it('voices each chord with exactly its chord tones', () => {
    const expected = { C: 'ceg', Am: 'ace', F: 'fac', G: 'gbd' }
    for (const [name, chord] of Object.entries(CHORDS)) {
      expect(pitchClasses(toMiniNotation(chord))).toEqual(new Set(expected[name as keyof typeof expected]))
    }
  })

  it('uses four-note seventh chords Dm7, G7, Cmaj7 and Am7 in the lo-fi loop', () => {
    const chords = [...toStrudelCode(jazzyChords).matchAll(/note\("([^"]*)"\)/g)].map((match) => pitchClasses(match[1]))
    expect(chords).toEqual([new Set('dfac'), new Set('gbdf'), new Set('cegb'), new Set('aceg')])
  })

  it('keeps lo-fi chords one bar long with shared notes and small voice movements through the loop', () => {
    const events = timeline(catOfNotes(jazzyChords), 4)
    const chords = Array.from({ length: 4 }, (_, bar) => {
      const notes = events.filter((event) => event.start === bar)
      expect(notes).toHaveLength(4)
      expect(notes.every((event) => event.end === bar + 1)).toBe(true)
      return notes.map((event) => midi(event.value)).sort((a, b) => a - b)
    })
    for (let bar = 0; bar < chords.length; bar++) {
      const chord = chords[bar]
      const next = chords[(bar + 1) % chords.length]
      expect(chord.filter((note) => next.includes(note)).length).toBeGreaterThanOrEqual(1)
      expect(chord.every((note, voice) => Math.abs(note - next[voice]) <= 3)).toBe(true)
      expect(chord.at(-1)! - chord[0]).toBeGreaterThan(12)
      // Avoid an adjacent semitone such as the previous B3–C4 cluster.
      expect(chord.slice(1).every((note, voice) => note - chord[voice] >= 2)).toBe(true)
    }
  })

  it('pairs every bass root with the note seven semitones above it', () => {
    for (const [, bar] of toStrudelCode(walkingRoots).matchAll(/note\("([^"]*)"\)/g)) {
      const notes = bar.split(' ').filter((token) => token !== '~')
      const [root] = notes
      const fifth = notes.find((note) => note !== root)!
      expect(midi(fifth) - midi(root)).toBe(7)
    }
  })
})
