import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluate, hush, initStrudel } from '@strudel/web'
import { fn, mini } from './index'
import { useStrudel } from './react'
import type { StrudelPattern } from './types'

vi.mock('@strudel/web', () => ({
    evaluate: vi.fn(),
    hush: vi.fn(),
    initStrudel: vi.fn(),
}))

const evaluateMock = vi.mocked(evaluate)
const hushMock = vi.mocked(hush)

describe('useStrudel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('initializes Strudel and plays code supplied by the caller', async () => {
        evaluateMock.mockResolvedValueOnce(undefined)
        const { result } = renderHook(() => useStrudel())

        expect(initStrudel).toHaveBeenCalledOnce()

        await act(async () => {
            await result.current.play('s("bd sd")')
        })

        expect(evaluateMock).toHaveBeenCalledWith('s("bd sd")')
        expect(result.current.status).toBe('playing')
        expect(result.current.error).toBeNull()
    })

    it('serializes a typed pattern before evaluating it', async () => {
        const { result } = renderHook(() => useStrudel())

        await act(async () => {
            await result.current.play(fn('sample', mini('bd')))
        })

        expect(evaluateMock).toHaveBeenCalledWith('s("bd")')
        expect(result.current.status).toBe('playing')
    })

    it('plays a native pattern without evaluating code', async () => {
        const native: StrudelPattern = { play: vi.fn(() => native) }
        const { result } = renderHook(() => useStrudel())

        await act(async () => {
            await result.current.play(native)
        })

        expect(native.play).toHaveBeenCalledOnce()
        expect(evaluateMock).not.toHaveBeenCalled()
        expect(result.current.status).toBe('playing')
    })

    it('converts a rejected evaluation into a typed error', async () => {
        const cause = new Error('invalid pattern')
        evaluateMock.mockRejectedValueOnce(cause)
        const { result } = renderHook(() => useStrudel())

        await act(async () => {
            await result.current.play('bad code')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error).toEqual({ code: 'evaluation', message: 'invalid pattern', cause })
    })

    it('can stop repeatedly and cleans up on unmount', () => {
        const { result, unmount } = renderHook(() => useStrudel())

        act(() => {
            result.current.stop()
            result.current.stop()
        })

        expect(hushMock).toHaveBeenCalledTimes(2)
        expect(result.current.status).toBe('idle')

        unmount()
        expect(hushMock).toHaveBeenCalledTimes(3)
    })
})
