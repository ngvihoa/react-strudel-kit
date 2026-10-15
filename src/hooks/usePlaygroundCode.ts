import { useState } from 'react'

type Props = {
    key: string
    code?: string
}

type Draft = {
    code: string
    saveStatus: 'saved' | 'unsaved' | 'unavailable'
}

const readStoredCode = (key: string, fallback: string): Draft => {
    try {
        const code = localStorage.getItem(key)
        return { code: code ?? fallback, saveStatus: code === null ? 'unsaved' : 'saved' }
    } catch {
        return { code: fallback, saveStatus: 'unavailable' }
    }
}

export const usePlaygroundCode = ({ key, code: initialCode = '' }: Props) => {
    const [draft, setDraft] = useState(() => readStoredCode(key, initialCode))

    // Persist user edits in the interaction that produced them. A fresh default
    // is not a saved draft until edited, loaded from an example, or reset.
    const setCode = (code: string) => {
        let saveStatus: Draft['saveStatus'] = 'saved'
        try {
            localStorage.setItem(key, code)
        } catch {
            saveStatus = 'unavailable'
        }
        setDraft({ code, saveStatus })
    }

    return {
        ...draft,
        setCode,
        reset: () => setCode(initialCode),
    }
}
