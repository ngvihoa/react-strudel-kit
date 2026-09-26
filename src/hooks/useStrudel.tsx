import { useEffect, useState } from 'react'
import { evaluate, hush, initStrudel } from '@strudel/web'


type TransportStatus = 'idle' | 'playing' | 'error'

type Props = {
    key: string
    code?: string
}

export const useStrudel = ({ key, code: initialCode = '' }: Props) => {
    const [code, setCode] = useState(() => localStorage.getItem(key) ?? initialCode)
    const [status, setStatus] = useState<TransportStatus>('idle')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        localStorage.setItem(key, code)
    }, [code, key])

    useEffect(() => {
        initStrudel()
        return () => hush()
    }, [])

    const play = async () => {
        try {
            setError(null)
            await evaluate(code)
            setStatus('playing')
        } catch (playError) {
            setStatus('error')
            setError(playError instanceof Error ? playError.message : 'Không thể chạy pattern.')
        }
    }

    const stop = () => {
        hush()
        setStatus('idle')
    }

    const reset = () => {
        stop()
        setCode(initialCode)
        setError(null)
    }

    return {
        code,
        setCode,
        status,
        error,
        play,
        stop,
        reset,
    }
}
