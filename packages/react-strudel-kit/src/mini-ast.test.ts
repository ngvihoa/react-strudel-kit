import { describe, expect, it } from 'vitest'
import { choice, degrade, fast, number, pitch, polymeter, raw, repeat, rest, sample, sequence, slow, stack, subcycle, weight } from './mini-ast'
import { toMiniNotation as serializeMini } from './mini-serializer'

describe('typed Mini-Notation AST', () => {
    it('serializes typed atoms and operators', () => {
        const pattern = sequence(
            repeat(sample('bd'), 4),
            rest(),
            pitch('eb3'),
            fast(sample('hh'), 2),
            weight(sample('sd'), 3),
            degrade(sample('cp')),
        )

        expect(serializeMini(pattern)).toBe('bd*4 ~ eb3 hh*2 sd@3 cp?')
    })

    it('serializes structural operators', () => {
        expect(serializeMini(subcycle(sequence(sample('bd'), sample('sd'))))).toBe('[bd sd]')
        expect(serializeMini(stack(sample('bd'), sample('hh')))).toBe('bd, hh')
        expect(serializeMini(choice(sample('bd'), sample('sd')))).toBe('bd | sd')
        expect(serializeMini(polymeter(sample('bd'), sample('hh')))).toBe('{bd, hh}')
    })

    it('serializes slow, numeric, and raw values', () => {
        expect(serializeMini(slow(number(3), 2))).toBe('3/2')
        expect(serializeMini(raw('bd!!!'))).toBe('bd!!!')
    })

    it('rejects invalid builder values', () => {
        expect(() => sample('bd sd')).toThrow('Invalid sample name')
        expect(() => number(Number.POSITIVE_INFINITY)).toThrow('Invalid Mini-Notation number')
        expect(() => repeat(sample('bd'), 0)).toThrow('Repeat count')
    })

})
