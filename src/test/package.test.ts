import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { evaluate } from '@strudel/web'
import { chain, fast, fn, mini, pattern, patternCallback, sample, sequence, toStrudelCode } from 'react-strudel-kit'
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

it('exports composition helpers and serializes the complete modifier contracts', () => {
    const callback = patternCallback(fn('rev'))
    const expression = chain(
        pattern({ name: 's', args: [mini('bd')] }),
        fn('compress', 0.25, 0.75), fn('early', 0.1), fn('late', 0.2),
        fn('swing', 4), fn('swingBy', 0.1, 4), fn('sometimesBy', 0.5, callback),
        fn('inside', 2, callback), fn('outside', 2, callback), fn('off', 0.5, callback),
    )
    expect(toStrudelCode(expression)).toBe(
        's("bd").compress(0.25, 0.75).early(0.1).late(0.2).swing(4).swingBy(0.1, 4)'
        + '.sometimesBy(0.5, x => x.rev()).inside(2, x => x.rev()).outside(2, x => x.rev()).off(0.5, x => x.rev())',
    )
})

it('keeps nested pattern timing when playing through the built package', async () => {
    const { result } = renderHook(() => useStrudel())

    await act(async () => {
        await result.current.play(fn('sample', fast(sequence(sample('bd'), sample('sd')), 2)))
    })

    expect(evaluate).toHaveBeenLastCalledWith('s("[bd sd]*2")', false)
    expect(result.current.status).toBe('playing')
})
