import { describe, expect, it } from 'vitest'
import { fn, functionRegistry, mini, toStrudelCode } from './index'

describe('function registry', () => {
    it('keeps domain and runtime metadata together', () => {
        expect(functionRegistry.sample).toEqual({ runtime: 's', kind: 'factory' })
        expect(functionRegistry.layer).toEqual({ runtime: 'stack', kind: 'factory' })
        expect(functionRegistry.lowPass).toEqual({ runtime: 'lpf', kind: 'modifier' })
    })

    it('supports the public one-import entrypoint', () => {
        expect(toStrudelCode(fn('sample', mini('bd')))).toBe('s("bd")')
    })
})
