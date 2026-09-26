import { useEffect, useState } from 'react'
import { evaluate, hush, initStrudel } from '@strudel/web'
import type { TransportStatus } from '../lib/types'



type Props = {
    key: string
    code?: string
}

const readStoredCode = (key: string, fallback: string) => {
    try {
        return localStorage.getItem(key) ?? fallback
    } catch {
        return fallback
    }
}

const writeStoredCode = (key: string, code: string) => {
    try {
        localStorage.setItem(key, code)
    } catch {
        // Storage may be unavailable when the browser blocks it.
    }
}

export const useStrudel = ({ key, code: initialCode = '' }: Props) => {
    const [code, setCode] = useState(() => readStoredCode(key, initialCode))
    const [status, setStatus] = useState<TransportStatus>('idle')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        writeStoredCode(key, code)
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
