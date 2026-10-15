import { StrictMode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { initStrudel } from '@strudel/web'
import { useStrudel } from './react'

vi.mock('@strudel/web', async () => {
    const { createMockWeb } = await import('../test/mockWeb')
    return createMockWeb()
})

it('shares one engine and transport across Strict Mode, consumers, and remounts', async () => {
    const first = renderHook(() => useStrudel(), { wrapper: StrictMode })
    const second = renderHook(() => useStrudel())

    await act(async () => {
        await first.result.current.play('note("c3")')
    })

    expect(initStrudel).toHaveBeenCalledOnce()
    expect(first.result.current.status).toBe('playing')
    expect(second.result.current.status).toBe('playing')
    const engine = await vi.mocked(initStrudel).mock.results[0].value
    vi.mocked(engine.stop).mockClear()

    first.unmount()
    expect(engine.stop).not.toHaveBeenCalled()
    expect(second.result.current.status).toBe('playing')

    act(() => second.result.current.stop())
    expect(second.result.current.status).toBe('idle')
    expect(engine.stop).toHaveBeenCalledOnce()

    await act(async () => {
        await second.result.current.play('note("d3")')
    })
    vi.mocked(engine.stop).mockClear()
    second.unmount()
    expect(engine.stop).toHaveBeenCalledOnce()

    const remounted = renderHook(() => useStrudel(), { wrapper: StrictMode })
    expect(remounted.result.current.status).toBe('idle')
    expect(initStrudel).toHaveBeenCalledOnce()
    remounted.unmount()
})
