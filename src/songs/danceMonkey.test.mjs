import { describe, expect, it } from 'vitest'
import * as Strudel from '@strudel/web/dist/index.mjs'
import { toMiniNotation, toStrudelCode } from 'react-strudel-kit'
import { DANCE_MONKEY_MELODY_BARS, DANCE_MONKEY_MIX, DANCE_MONKEY_PARTS, DANCE_MONKEY_PATTERN, DANCE_MONKEY_BPM } from './danceMonkey'

// Match initStrudel's Mini-Notation string handling, without initializing audio.
Strudel.miniAllStrings()

// Exercise the kit's engine boundary against the pinned Strudel runtime.
// Musical timings below query the mix before its absolute-tempo modifier.
const evaluate = (code) => new Function('scope', `with (scope) { return ${code} }`)(Strudel)
const compile = (expression = DANCE_MONKEY_MIX) => evaluate(toStrudelCode(expression))

const melodyEvents = (pattern, begin, end) => pattern.queryArc(begin, end)
  .filter((event) => event.value.attack === 0.008)
  .map((event) => ({ note: event.value.note, start: Number(event.whole.begin) - begin }))

// Preserve the former notation only as a regression reference. The teaching
// example itself now uses typed pitch/rest/weight/sequence builders.
const originalMelodyBars = [
  'a4@2 a4 a4 g#4@2 g#4 g#4 g#4@2 f#4 f#4 a4@3 f#4',
  '~@11 f#4 a4 a4@2 g#4',
  '~@2 g#4 f#4 g#4 f#4 g#4 f#4 g#4 f#4 ~@2 a4@2 g#4@2',
  'f#4@2 a4@2 ~@4 f#4@4 f#4@4',
  'a4@2 a4 a4 g#4@2 g#4 g#4 g#4@2 f#4 f#4 a4@3 f#4',
  '~@11 f#4 a4 a4@2 g#4',
  '~@2 f#4@2 g#4@2 f#4@2 g#4 f#4@2 a4 ~@2 g#4@2',
  'f#4@2 a4@2 ~@8 f#4@2 e4@2',
]

// Former accompaniment, kept only here to verify that the readable builders
// preserve every event's timing and sound controls through two chord loops.
const originalAccompaniment = {
  bass: 'note("<[f#2 ~ f#2 f#2 ~ c#3 f#2 ~] [d2 ~ d2 d2 ~ a2 d2 ~] [e2 ~ e2 e2 ~ b2 e2 ~] [c#2 ~ c#2 c#2 ~ g#2 c#2 ~]>").gain(0.42).lpf(650).clip(0.65).s("sine").attack(0.003).decay(0.09).sustain(0.3).release(0.04)',
  keys: 'note("<[c#4 f#4 a4 f#4]*2 [d4 f#4 a4 f#4]*2 [e4 g#4 b4 g#4]*2 [c#4 e4 g#4 e4]*2>").gain(0.14).lpf(2200).pan(0.35).room(0.18).clip(0.6).s("triangle").attack(0.002).decay(0.12).sustain(0).release(0.06)',
  kick: 'note("c2*4").gain(0.75).s("sine").penv(24).pdecay(0.04).decay(0.13).sustain(0).release(0.03)',
  snare: 's("~ white ~ white").gain(0.16).hpf(1200).lpf(8000).decay(0.09).sustain(0).release(0.03)',
  hats: 's("white*8").gain("0.055 0.09").hpf(7000).pan(0.65).decay(0.025).sustain(0).release(0.01)',
}

const partTimeline = (pattern) => pattern.queryArc(0, 8).map((event) => ({
  value: event.value,
  start: Number(event.whole.begin),
  end: Number(event.whole.end),
})).sort((a, b) => a.start - b.start)

const noteTimeline = (code) => Strudel.m(code).queryArc(0, 1).map((event) => ({
  pitch: event.value,
  start: Number(event.whole.begin),
  end: Number(event.whole.end),
}))

describe('Dance Monkey arrangement against the real Strudel engine', () => {
  it.each(Object.entries(originalAccompaniment))(
    'preserves all pitches, rests, durations and sound controls for rewritten %s',
    (part, original) => {
      expect(partTimeline(compile(DANCE_MONKEY_PARTS[part]))).toEqual(partTimeline(evaluate(original)))
    },
  )

  it('applies the documented hi-hat levels to the first and second halves of each bar', () => {
    const hats = compile(DANCE_MONKEY_PARTS.hats).queryArc(0, 1)
    expect(hats.map((event) => event.value.gain)).toEqual([
      0.055, 0.055, 0.055, 0.055, 0.09, 0.09, 0.09, 0.09,
    ])
  })

  it.each(originalMelodyBars.map((code, index) => [index + 1, code]))(
    'preserves the pitches, rests and durations of rewritten bar %i',
    (barNumber, original) => {
      expect(noteTimeline(toMiniNotation(DANCE_MONKEY_MELODY_BARS[barNumber - 1]))).toEqual(noteTimeline(original))
    },
  )

  it('keeps the documented sixteen-unit counting convention in every bar', () => {
    expect(DANCE_MONKEY_MELODY_BARS).toHaveLength(8)
    for (const bar of DANCE_MONKEY_MELODY_BARS) {
      expect(bar.kind).toBe('sequence')
      const units = bar.items.reduce((total, item) => total + (item.kind === 'weight' ? item.amount : 1), 0)
      expect(units).toBe(16)
    }
  })

  it('plays the typed mix with the chorus sixteenth-note rhythm', () => {
    const pattern = compile()
    expect(melodyEvents(pattern, 0, 1)).toEqual([
      { note: 'a4', start: 0 },
      { note: 'a4', start: 2 / 16 },
      { note: 'a4', start: 3 / 16 },
      { note: 'g#4', start: 4 / 16 },
      { note: 'g#4', start: 6 / 16 },
      { note: 'g#4', start: 7 / 16 },
      { note: 'g#4', start: 8 / 16 },
      { note: 'f#4', start: 10 / 16 },
      { note: 'f#4', start: 11 / 16 },
      { note: 'a4', start: 12 / 16 },
      { note: 'f#4', start: 15 / 16 },
    ])
    expect(melodyEvents(pattern, 1, 2)[0]).toEqual({ note: 'f#4', start: 11 / 16 })
  })

  it('loops the melody after eight bars and keeps bass harmony aligned', () => {
    const pattern = compile()
    expect(melodyEvents(pattern, 8, 16)).toEqual(melodyEvents(pattern, 0, 8))
    const bass = pattern.queryArc(0, 8)
      .filter((event) => event.value.attack === 0.003 && Number(event.whole.begin) % 1 === 0)
      .sort((a, b) => Number(a.whole.begin) - Number(b.whole.begin))
      .map((event) => event.value.note)
    expect(bass).toEqual(['f#2', 'd2', 'e2', 'c#2', 'f#2', 'd2', 'e2', 'c#2'])
  })

  it('uses only built-in sounds and a steady kick, backbeat, and eighth-note hats', () => {
    const pattern = compile()
    const events = pattern.queryArc(0, 1)
    expect([...new Set(events.map((event) => event.value.s))].sort()).toEqual(['sine', 'triangle', 'white'])
    expect(events.every((event) => event.value.postgain === 0.8)).toBe(true)
    // Output attenuation must retain the quieter keys and hats in the mix.
    expect(events.find((event) => event.value.attack === 0.008).value.gain).toBe(0.48)
    expect(events.find((event) => event.value.attack === 0.002).value.gain).toBe(0.14)
    expect(events.find((event) => event.value.decay === 0.025).value.gain).toBe(0.055)
    const onsets = (decay) => events.filter((event) => event.value.decay === decay)
      .map((event) => Number(event.whole.begin))
    expect(onsets(0.13)).toEqual([0, 0.25, 0.5, 0.75])
    expect(events.filter((event) => event.value.s === 'white' && event.value.decay === 0.09)
      .map((event) => Number(event.whole.begin))).toEqual([0.25, 0.75])
    expect(onsets(0.025)).toEqual([0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875])
  })

  it('encodes absolute tempo in the typed pattern without a global tempo statement', () => {
    const code = toStrudelCode(DANCE_MONKEY_PATTERN)
    expect(DANCE_MONKEY_BPM).toBe(98)
    expect(code).toMatch(/\.cpm\(24\.5\)$/)
    // The standalone runtime assumes one scheduler cycle per second; its
    // absolute cpm modifier stretches the phrase to its duration in seconds.
    const pattern = new Function('scope', `with (scope) { return ${code} }`)(Strudel)
    const secondsPerBar = 60 / (DANCE_MONKEY_BPM / 4)
    const first = melodyEvents(pattern, 0, secondsPerBar)
    expect(first[1].start).toBeCloseTo(secondsPerBar * 2 / 16)
    expect(first).toHaveLength(11)
  })
})
