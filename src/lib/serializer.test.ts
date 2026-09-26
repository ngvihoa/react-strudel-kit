import { describe, expect, it } from 'vitest'
import { mini } from './mini'
import { toStrudelCode } from './serializer'

describe('toStrudelCode', () => {
    it('serializes a typed pattern and its modifier chain', () => {
        expect(toStrudelCode({
            source: { name: 's', args: [mini('bd sd')] },
            chain: [
                { name: 'gain', args: [0.8] },
                { name: 'fast', args: [2] },
                { name: 'rev', args: [] },
            ],
        })).toBe('s("bd sd").gain(0.8).fast(2).rev()')
    })

    it('serializes nested pattern factories', () => {
        expect(toStrudelCode({
            source: {
                name: 'stack',
                args: [
                    { source: { name: 's', args: [mini('bd')] } },
                    { source: { name: 'note', args: [mini('c3 e3')] } },
                ],
            },
        })).toBe('stack(s("bd"), note("c3 e3"))')
    })

    it('serializes Strudel silence as a value', () => {
        expect(toStrudelCode({ source: { name: 'silence', args: [] } })).toBe('silence')
    })

    it('passes raw Strudel code through unchanged', () => {
        expect(toStrudelCode('s("bd sd")')).toBe('s("bd sd")')
    })
})