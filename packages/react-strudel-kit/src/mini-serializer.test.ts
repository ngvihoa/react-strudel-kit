import { describe, expect, it } from 'vitest'
import { parse } from '@strudel/mini/krill-parser.js'
import {
    choice, degrade, fast, polymeter, raw, repeat, sample, sequence, slow,
    stack, subcycle, weight,
} from './mini-ast'
import { toMiniNotation } from './mini-serializer'

const bd = sample('bd')
const sd = sample('sd')
const hh = sample('hh')
const phrase = sequence(bd, sd)

describe('nested Mini-Notation serialization', () => {
    it.each([
        ['fast sequence', fast(phrase, 2), '[bd sd]*2'],
        ['slow sequence', slow(phrase, 2), '[bd sd]/2'],
        ['repeat stack', repeat(stack(bd, sd), 2), '[bd, sd]*2'],
        ['weighted sequence', weight(phrase, 3), '[bd sd]@3'],
        ['degraded choice', degrade(choice(bd, sd), 0.25), '[bd | sd]?0.25'],
        ['nested sequence', sequence(bd, sequence(sd, hh)), 'bd [sd hh]'],
        ['stack in sequence', sequence(stack(bd, sd), hh), '[bd, sd] hh'],
        ['choice in sequence', sequence(choice(bd, sd), hh), '[bd | sd] hh'],
        ['stack in choice', choice(stack(bd, sd), hh), '[bd, sd] | hh'],
        ['choice in stack', stack(choice(bd, sd), hh), '[bd | sd], hh'],
        ['nested choice', choice(choice(bd, sd), hh), '[bd | sd] | hh'],
        ['sequence lanes', stack(phrase, hh), 'bd sd, hh'],
        ['choice sequence lanes', choice(phrase, hh), 'bd sd | hh'],
        ['polymeter sequence lanes', polymeter(phrase, sequence(hh, hh, hh)), '{bd sd, hh hh hh}'],
        ['polymeter with choice lane', polymeter(choice(bd, sd), hh), '{[bd | sd], hh}'],
        ['nested modifiers', slow(fast(phrase, 2), 3), '[[bd sd]*2]/3'],
        ['nested weights', sequence(weight(weight(bd, 2), 3), hh), '[bd@2]@3 hh'],
        ['explicit group operand', fast(subcycle(phrase), 2), '[bd sd]*2'],
        ['polymeter operand', fast(polymeter(phrase, hh), 2), '{bd sd, hh}*2'],
        ['opaque raw operand', fast(raw('bd sd'), 2), '[bd sd]*2'],
        ['opaque raw sequence child', sequence(raw('bd, sd'), hh), '[bd, sd] hh'],
        ['unchanged raw root', raw('bd!!!'), 'bd!!!'],
    ] as const)('preserves %s and is accepted by the Strudel parser', (_name, node, expected) => {
        const code = toMiniNotation(node)
        expect(code).toBe(expected)
        expect(() => parse(JSON.stringify(code))).not.toThrow()
    })
})
