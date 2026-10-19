import { describe, expect, it } from 'vitest'
import * as Strudel from '@strudel/web/dist/index.mjs'
import { toStrudelCode } from 'react-strudel-kit'
import { DANCE_MONKEY } from './examples'
import { buildMix, createMixSettings } from './mixer'

Strudel.miniAllStrings()
const events = (mix) => {
  const code = toStrudelCode(buildMix(DANCE_MONKEY, mix))
  const pattern = new Function('scope', `with (scope) { return ${code} }`)(Strudel)
  return pattern.queryArc(0, 20).map((event) => event.value)
}

describe('interactive mix against the real Strudel engine', () => {
  it('removes muted parts and includes only selected solo parts', () => {
    const mix = createMixSettings(DANCE_MONKEY)
    mix.tracks.melody.muted = true
    expect(events(mix).some((value) => value.attack === 0.008)).toBe(false)
    expect(events(mix).some((value) => value.attack === 0.003)).toBe(true)
    mix.tracks.bass.solo = true
    mix.tracks.kick.solo = true
    const soloed = events(mix)
    expect(soloed.length).toBeGreaterThan(0)
    expect(soloed.every((value) => value.attack === 0.003 || value.decay === 0.13)).toBe(true)
  })

  it('changes sound and levels without overwriting the arranged part gains', () => {
    const mix = createMixSettings(DANCE_MONKEY)
    mix.volume = 50
    mix.tracks.melody.volume = 25
    mix.tracks.melody.instrument = 'sine'
    const melody = events(mix).filter((value) => value.attack === 0.008)
    expect(melody.length).toBeGreaterThan(0)
    expect(melody.every((value) => value.s === 'sine' && value.velocity === 0.25 && value.postgain === 0.5 && value.gain === 0.48)).toBe(true)
  })

  it('supports a silent mix and restores sound when a part is unmuted', () => {
    const mix = createMixSettings(DANCE_MONKEY)
    Object.values(mix.tracks).forEach((track) => { track.muted = true })
    expect(events(mix)).toEqual([])
    mix.tracks.bass.muted = false
    expect(events(mix).length).toBeGreaterThan(0)
    expect(events(mix).every((value) => value.attack === 0.003)).toBe(true)
  })
})
