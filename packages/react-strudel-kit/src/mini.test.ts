import { describe, expect, it } from 'vitest'
import { assertMiniNotation, isMiniNotation, mini } from './mini'

describe('Mini-Notation validation', () => {
    it('accepts Strudel Mini-Notation grammar', () => {
        expect(isMiniNotation('bd*4')).toBe(true)
        expect(isMiniNotation('<c3 eb3 f3 g3>')).toBe(true)
        expect(isMiniNotation('[bd sd], hh')).toBe(true)
    })

    it('rejects invalid grammar', () => {
        expect(isMiniNotation('[bd sd')).toBe(false)
        expect(() => mini('[bd sd')).toThrow('Invalid Strudel Mini-Notation')
    })

    it('narrows values with an assertion', () => {
        const value = 'bd*4'

        assertMiniNotation(value)

        expect(value).toBe('bd*4')
    })
})