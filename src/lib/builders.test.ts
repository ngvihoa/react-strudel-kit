import { describe, expect, it } from 'vitest'
import { mini } from './mini'
import { fast as miniFast, repeat, sample, sequence } from './mini-ast'
import { chain, every, gain, note, patternCallback, s, stackPattern, when } from './builders'
import { toStrudelCode } from './serializer'

describe('typed Strudel builders', () => {
    it('builds a simple pattern without object literals', () => {
        expect(toStrudelCode(chain(
            s(sequence(repeat(sample('bd'), 4), miniFast(sample('hh'), 2))),
            gain(0.8),
        ))).toBe('s("bd*4 hh*2").gain(0.8)')
    })

    it('builds nested patterns and callback modifiers', () => {
        const drums = s(mini('bd sd'))
        const melody = note(mini('c3 eb3'))

        expect(toStrudelCode(chain(
            stackPattern(drums, melody),
            every(4, patternCallback(gain(0.7))),
            when(mini('0 1'), patternCallback()),
        ))).toBe('stack(s("bd sd"), note("c3 eb3")).every(4, x => x.gain(0.7)).when("0 1", x => x)')
    })
})