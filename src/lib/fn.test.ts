import { describe, expect, it } from 'vitest'
import { mini } from './mini'
import { fast, sample } from './mini-ast'
import { chain } from './builders'
import { fn } from './fn'
import { toStrudelCode } from './serializer'

describe('fn registry', () => {
    it('builds nested functions with one import', () => {
        const expression = fn(
            'stack',
            fn('sample', mini('bd')),
            fn('note', mini('c3 eb3')),
        )

        expect(toStrudelCode(expression)).toBe('stack(s("bd"), note("c3 eb3"))')
    })

    it('maps domain names to Strudel names', () => {
        expect(toStrudelCode(chain(
            fn('sample', fast(sample('bd'), 2)),
            fn('lowPass', 900),
            fn('rev'),
        ))).toBe('s("bd*2").lpf(900).rev()')
    })

    it('supports callback functions through the same registry', () => {
        expect(toStrudelCode(chain(
            fn('sample', mini('bd')),
            fn('every', 4, { chain: [fn('rev')] }),
        ))).toBe('s("bd").every(4, x => x.rev())')
    })

    it('supports temporal and callback modifiers from the registry', () => {
        expect(toStrudelCode(chain(
            fn('sample', mini('hh*8')),
            fn('swing', 4),
            fn('early', 0.25),
            fn('compress', 0.25, 0.75),
            fn('inside', 4, { chain: [fn('rev')] }),
            fn('sometimesBy', 0.4, { chain: [fn('fast', 2)] }),
        ))).toBe('s("hh*8").swing(4).early(0.25).compress(0.25, 0.75).inside(4, x => x.rev()).sometimesBy(0.4, x => x.fast(2))')
    })
})
