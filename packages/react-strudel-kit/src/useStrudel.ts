import { useSyncExternalStore } from 'react'
import { createEngine, unlockAudio } from './engine'
import { createTransport } from './transport'
import type { UseStrudelResult } from './types'

const transport = createTransport({ createEngine, unlockAudio })

/** Controls Strudel playback; editor state and persistence belong to the app. */
export const useStrudel = (): UseStrudelResult => {
    const snapshot = useSyncExternalStore(transport.subscribe, transport.getSnapshot, transport.getServerSnapshot)
    return { ...snapshot, play: transport.play, update: transport.update, stop: transport.stop }
}
