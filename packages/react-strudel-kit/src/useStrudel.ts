import { useEffect, useState } from 'react'
import { evaluate, hush, initStrudel } from '@strudel/web'
import { toStrudelCode } from './serializer'
import type { StrudelError, StrudelInput, TransportStatus, UseStrudelResult } from './types'

/** Controls Strudel playback; editor state and persistence belong to the app. */
export const useStrudel = (): UseStrudelResult => {
    const [status, setStatus] = useState<TransportStatus>('idle')
    const [error, setError] = useState<StrudelError | null>(null)

    useEffect(() => {
        initStrudel()
        return () => hush()
    }, [])

    const play = async (input: StrudelInput) => {
        try {
            setError(null)
            if (typeof input === 'object' && 'play' in input) {
                input.play()
            } else {
                await evaluate(toStrudelCode(input))
            }
            setStatus('playing')
        } catch (cause) {
            setStatus('error')
            setError({
                code: typeof input === 'object' && 'play' in input ? 'transport' : 'evaluation',
                message: cause instanceof Error ? cause.message : 'Không thể chạy pattern.',
                cause,
            })
        }
    }

    const stop = () => {
        hush()
        setStatus('idle')
        setError(null)
    }

    return { status, error, play, stop }
}
