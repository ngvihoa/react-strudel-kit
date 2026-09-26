import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluate, hush, initStrudel } from '@strudel/web'
import { useStrudel } from './useStrudel'

vi.mock('@strudel/web', () => ({
    evaluate: vi.fn(),
    hush: vi.fn(),
    initStrudel: vi.fn(),
}))

const evaluateMock = vi.mocked(evaluate)
const hushMock = vi.mocked(hush)
const initStrudelMock = vi.mocked(initStrudel)

describe('useStrudel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.localStorage.clear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('loads and persists code while initializing Strudel', () => {
        window.localStorage.setItem('pattern', 'stored pattern')

        const { result } = renderHook(() => useStrudel({ key: 'pattern', code: 'default pattern' }))

        expect(result.current.code).toBe('stored pattern')
        expect(initStrudelMock).toHaveBeenCalledOnce()
        expect(window.localStorage.getItem('pattern')).toBe('stored pattern')
    })

    it('plays the current code and updates the status', async () => {
        evaluateMock.mockResolvedValueOnce(undefined)
        const { result } = renderHook(() => useStrudel({ key: 'pattern', code: 'play me' }))

        await act(async () => {
            await result.current.play()
        })

        expect(evaluateMock).toHaveBeenCalledWith('play me')
        expect(result.current.status).toBe('playing')
        expect(result.current.error).toBeNull()
    })

    it('converts evaluation errors into error state', async () => {
        evaluateMock.mockRejectedValueOnce(new Error('invalid pattern'))
        const { result } = renderHook(() => useStrudel({ key: 'pattern', code: 'bad code' }))

        await act(async () => {
            await result.current.play()
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error).toBe('invalid pattern')
    })

    it('can stop repeatedly and cleans up on unmount', () => {
        const { result, unmount } = renderHook(() => useStrudel({ key: 'pattern', code: 'pattern' }))

        act(() => {
            result.current.stop()
            result.current.stop()
        })

        expect(hushMock).toHaveBeenCalledTimes(2)
        expect(result.current.status).toBe('idle')

        unmount()

        expect(hushMock).toHaveBeenCalledTimes(3)
    })

    it('keeps working when localStorage is unavailable', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('storage blocked')
        })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('storage blocked')
        })

        const { result } = renderHook(() => useStrudel({ key: 'pattern', code: 'fallback' }))

        expect(result.current.code).toBe('fallback')

        act(() => {
            result.current.reset()
        })

        expect(result.current.code).toBe('fallback')
        expect(result.current.status).toBe('idle')
    })
})