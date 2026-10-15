import { useEffect, useState } from 'react'

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

export const usePlaygroundCode = ({ key, code: initialCode = '' }: Props) => {
    const [code, setCode] = useState(() => readStoredCode(key, initialCode))

    useEffect(() => {
        writeStoredCode(key, code)
    }, [code, key])

    return {
        code,
        setCode,
        reset: () => setCode(initialCode),
    }
}
