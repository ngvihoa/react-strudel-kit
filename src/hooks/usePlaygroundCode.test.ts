import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlaygroundCode } from './usePlaygroundCode'

describe('playground code persistence', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('loads saved code, persists edits, and resets to the default', () => {
        window.localStorage.setItem('pattern', 'stored pattern')
        const { result } = renderHook(() => usePlaygroundCode({ key: 'pattern', code: 'default pattern' }))

        expect(result.current.code).toBe('stored pattern')

        act(() => result.current.setCode('edited pattern'))
        expect(window.localStorage.getItem('pattern')).toBe('edited pattern')

        act(() => result.current.reset())
        expect(result.current.code).toBe('default pattern')
        expect(window.localStorage.getItem('pattern')).toBe('default pattern')
    })

    it('keeps editing and reset working when storage is blocked', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('storage blocked')
        })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('storage blocked')
        })
        const { result } = renderHook(() => usePlaygroundCode({ key: 'pattern', code: 'fallback' }))

        act(() => result.current.setCode('edited pattern'))
        expect(result.current.code).toBe('edited pattern')

        act(() => result.current.reset())
        expect(result.current.code).toBe('fallback')
    })
})
