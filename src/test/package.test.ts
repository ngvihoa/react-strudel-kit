import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { evaluate } from '@strudel/web'
import { fn, mini } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

vi.mock('@strudel/web', () => ({
    evaluate: vi.fn(),
    hush: vi.fn(),
    initStrudel: vi.fn(),
}))

it('plays a typed pattern through the built package public entrypoints', async () => {
    const { result } = renderHook(() => useStrudel())

    await act(async () => {
        await result.current.play(fn('stack', fn('sample', mini('bd')), fn('note', mini('c3 eb3'))))
    })

    expect(evaluate).toHaveBeenCalledWith('stack(s("bd"), note("c3 eb3"))')
    expect(result.current.status).toBe('playing')
})
