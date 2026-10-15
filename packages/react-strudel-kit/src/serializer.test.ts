import { describe, expect, it } from 'vitest'
import { mini } from './mini'
import { fast, repeat, sample, sequence } from './mini-ast'
import { toStrudelCode } from './serializer'

describe('toStrudelCode', () => {
    it('serializes a typed pattern and its modifier chain', () => {
        expect(toStrudelCode({
            root: { name: 's', args: [mini('bd sd')] },
            chain: [
                { name: 'gain', args: [0.8] },
                { name: 'fast', args: [2] },
                { name: 'rev' },
            ],
        })).toBe('s("bd sd").gain(0.8).fast(2).rev()')
    })

    it('serializes nested pattern factories', () => {
        expect(toStrudelCode({
            root: {
                name: 'stack',
                args: [
                    { root: { name: 's', args: [mini('bd')] } },
                    { root: { name: 'note', args: [mini('c3 e3')] } },
                ],
            },
        })).toBe('stack(s("bd"), note("c3 e3"))')
    })

    it('serializes Strudel silence as a value', () => {
        expect(toStrudelCode({ root: { name: 'silence' } })).toBe('silence')
    })

    it('passes raw Strudel code through unchanged', () => {
        expect(toStrudelCode('s("bd sd")')).toBe('s("bd sd")')
    })

    it('serializes typed Mini-Notation AST inside Strudel calls', () => {
        expect(toStrudelCode({
            root: {
                name: 's',
                args: [sequence(repeat(sample('bd'), 4), fast(sample('hh'), 2))],
            },
        })).toBe('s("bd*4 hh*2")')
    })

    it('serializes typed callback modifiers', () => {
        expect(toStrudelCode({
            root: { name: 's', args: [mini('bd')] },
            chain: [
                { name: 'every', args: [4, { chain: [{ name: 'rev' }] }] },
                { name: 'sometimes', args: [{ chain: [{ name: 'fast', args: [2] }] }] },
                { name: 'when', args: [mini('0 1'), { chain: [{ name: 'degrade' }] }] },
            ],
        })).toBe('s("bd").every(4, x => x.rev()).sometimes(x => x.fast(2)).when("0 1", x => x.degrade())')
    })
})