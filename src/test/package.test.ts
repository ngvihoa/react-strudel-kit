import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { evaluate } from '@strudel/web'
import { fast, fn, mini, sample, sequence } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

vi.mock('@strudel/web', async () => {
    const { createMockWeb } = await import('../../packages/react-strudel-kit/test/mockWeb')
    return createMockWeb()
})

it('plays a typed pattern through the built package public entrypoints', async () => {
    const { result } = renderHook(() => useStrudel())

    await act(async () => {
        await result.current.play(fn('stack', fn('sample', mini('bd')), fn('note', mini('c3 eb3'))))
    })

    expect(evaluate).toHaveBeenCalledWith('stack(s("bd"), note("c3 eb3"))', false)
    expect(result.current.status).toBe('playing')
})

it('keeps nested pattern timing when playing through the built package', async () => {
    const { result } = renderHook(() => useStrudel())

    await act(async () => {
        await result.current.play(fn('sample', fast(sequence(sample('bd'), sample('sd')), 2)))
    })

    expect(evaluate).toHaveBeenLastCalledWith('s("[bd sd]*2")', false)
    expect(result.current.status).toBe('playing')
})
