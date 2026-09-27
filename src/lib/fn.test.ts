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
})
