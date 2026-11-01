import { describe, expect, it } from 'vitest'
import { m } from '@strudel/web/dist/index.mjs'
import { toStrudelCode } from 'react-strudel-kit'
import type { PatternExpression } from 'react-strudel-kit'
import { FIRST_SONG_STEPS } from './firstSong'
import { busierKick, kickOneThree, snareTwoFour } from './examples/backbeat'
import { offBeatHats, offBeatHatsRepeat } from './examples/fourOnTheFloor'
import { accentedHats, swellingHats } from './examples/hiHatAccents'
import { twinkle, twinkleDetached } from './examples/simpleMelody'

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
})
