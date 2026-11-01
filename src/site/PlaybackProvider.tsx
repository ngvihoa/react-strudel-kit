import { useState } from 'react'
import type { ReactNode } from 'react'
import { OwnerContext } from './playback'
import type { Owner } from './playback'

/** Tracks which page player started the shared transport, so only that player shows "Playing". */
export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner>(null)
  return <OwnerContext.Provider value={{ owner, setOwner }}>{children}</OwnerContext.Provider>
}
