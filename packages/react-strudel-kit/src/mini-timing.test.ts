import { describe, expect, it } from 'vitest'
import { m } from '@strudel/web/dist/index.mjs'
import { choice, degrade, fast, polymeter, sample, sequence, slow, stack, weight } from './mini-ast'
import type { MiniNode } from './mini-ast'
import { toMiniNotation } from './mini-serializer'

// Use Strudel's real ESM pattern engine, without initializing any audio engine.
const events = (code: string, cycles = 1) => m(code).queryArc(0, cycles)
    .map((hap) => ({ value: hap.value, start: Number(hap.whole.begin), end: Number(hap.whole.end) }))
    .sort((a, b) => a.start - b.start || String(a.value).localeCompare(String(b.value)))

const timeline = (node: MiniNode, cycles = 1) => events(toMiniNotation(node), cycles)
const bd = sample('bd')
const sd = sample('sd')
const hh = sample('hh')

describe('Mini-Notation timing against the real Strudel engine', () => {
    it('speeds up the entire sequence, including its first note', () => {
        expect(timeline(fast(sequence(bd, sd), 2))).toEqual([
            { value: 'bd', start: 0, end: 0.25 },
            { value: 'sd', start: 0.25, end: 0.5 },
            { value: 'bd', start: 0.5, end: 0.75 },
            { value: 'sd', start: 0.75, end: 1 },
        ])
    })

    it('slows the whole sequence over two cycles', () => {
        expect(timeline(slow(sequence(bd, sd), 2), 2)).toEqual([
            { value: 'bd', start: 0, end: 1 },
            { value: 'sd', start: 1, end: 2 },
        ])
    })

    it('keeps a nested sequence within one parent step', () => {
        expect(timeline(sequence(bd, sequence(sd, hh)))).toEqual([
            { value: 'bd', start: 0, end: 0.5 },
            { value: 'sd', start: 0.5, end: 0.75 },
            { value: 'hh', start: 0.75, end: 1 },
        ])
    })

    it('keeps parallel notes in one parent step', () => {
        expect(timeline(sequence(stack(bd, sd), hh))).toEqual([
            { value: 'bd', start: 0, end: 0.5 },
            { value: 'sd', start: 0, end: 0.5 },
            { value: 'hh', start: 0.5, end: 1 },
        ])
    })

    it('does not add an inner weight to an outer weight', () => {
        expect(timeline(sequence(weight(weight(bd, 2), 3), hh))).toEqual([
            { value: 'bd', start: 0, end: 0.75 },
            { value: 'hh', start: 0.75, end: 1 },
        ])
    })

    it('preserves the independent step lengths of polymeter lanes', () => {
        expect(timeline(polymeter(sequence(bd, sd), sequence(hh, hh, hh)))).toEqual([
            { value: 'bd', start: 0, end: 0.5 },
            { value: 'hh', start: 0, end: 0.5 },
            { value: 'hh', start: 0.5, end: 1 },
            { value: 'sd', start: 0.5, end: 1 },
        ])
    })

    it('preserves nested random choices and mixed parallel/choice groups', () => {
        expect(timeline(choice(choice(bd, sd), hh), 16)).toEqual(events('[bd | sd] | hh', 16))
        expect(timeline(choice(stack(bd, sd), hh), 16)).toEqual(events('[bd, sd] | hh', 16))
        expect(timeline(stack(choice(bd, sd), hh), 16)).toEqual(events('[bd | sd], hh', 16))
    })

    it('applies degradation to a whole nested pattern', () => {
        expect(timeline(degrade(sequence(bd, sd), 1))).toEqual([])
        expect(timeline(degrade(sequence(bd, sd), 0.25), 16)).toEqual(events('[bd sd]?0.25', 16))
    })
})
