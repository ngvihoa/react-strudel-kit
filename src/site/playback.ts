import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useStrudel } from 'react-strudel-kit/react'
import type { PatternExpression } from 'react-strudel-kit'

export type Owner = { id: string, label: string } | null

export const OwnerContext = createContext<{ owner: Owner, setOwner: (owner: Owner) => void } | null>(null)

export const usePlaybackOwner = () => {
  const context = useContext(OwnerContext)
  if (!context) throw new Error('usePlaybackOwner must be used inside PlaybackProvider')
  return context
}

export type PlayerState = 'ready' | 'starting' | 'playing' | 'error'

/**
 * One page player on top of the shared transport. Changes while playing use update();
 * changes while stopped never autoplay; unmounting the owning player stops playback.
 */
export const usePlayer = (id: string, label: string, pattern: PatternExpression) => {
  const { status, error, play, update, stop } = useStrudel()
  const { owner, setOwner } = usePlaybackOwner()
  const [starting, setStarting] = useState(false)
  const request = useRef(0)
  const owns = owner?.id === id
  const live = owns && status === 'playing'

  useEffect(() => {
    if (live) void update(pattern)
  }, [live, pattern, update])

  const ownsRef = useRef(owns)
  useEffect(() => { ownsRef.current = owns }, [owns])
  useEffect(() => () => { if (ownsRef.current) stop() }, [stop])

  const start = async () => {
    const current = ++request.current
    setOwner({ id, label })
    setStarting(true)
    try {
      await play(pattern)
    } finally {
      if (current === request.current) setStarting(false)
    }
  }

  const halt = () => {
    request.current++
    setStarting(false)
    if (owns) stop()
  }

  const state: PlayerState = !owns ? 'ready' : starting ? 'starting' : status === 'playing' ? 'playing' : status === 'error' ? 'error' : 'ready'
  return { state, error: owns ? error : null, start, stop: halt }
}
