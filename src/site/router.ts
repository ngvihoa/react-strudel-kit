import { useSyncExternalStore } from 'react'
import type { MouseEvent } from 'react'

// History routes use the host's SPA fallback for direct visits and reloads.
export const ROUTES = {
  firstSong: '/learn/first-song',
  makeBeat: '/learn/make-a-beat',
  addBass: '/learn/add-a-bass-line',
  kick: '/cookbook/kick',
  snare: '/cookbook/snare',
  hiHat: '/cookbook/hi-hat',
  bass: '/cookbook/bass',
  keys: '/cookbook/keys',
  lead: '/cookbook/lead',
  pad: '/cookbook/pad',
  simpleMelody: '/examples/simple-melody',
  fourOnTheFloor: '/examples/four-on-the-floor',
  backbeat: '/examples/backbeat',
  hiHatAccents: '/examples/hi-hat-accents',
  bassLine: '/examples/bass-line',
  chords: '/examples/chords-and-arpeggios',
  layerASong: '/examples/layer-a-song',
  reactMixer: '/examples/react-mixer',
  lofi: '/examples/lofi-loop',
  house: '/examples/house-loop',
  danceMonkey: '/examples/dance-monkey',
  api: '/api',
  playground: '/playground',
} as const

export type RoutePath = typeof ROUTES[keyof typeof ROUTES]

const KNOWN = new Set<string>(Object.values(ROUTES))
const NAVIGATE = 'site:navigate'

/** Keep old bookmarks working without adding an entry to browser history. */
export const migrateLegacyRoute = () => {
  if (!window.location.hash.startsWith('#/')) return
  const legacy = new URL(window.location.hash.slice(1), window.location.origin)
  if (!KNOWN.has(legacy.pathname)) return
  window.history.replaceState(window.history.state, '', `${legacy.pathname}${legacy.search || window.location.search}${legacy.hash}`)
}

const readRoute = (): RoutePath => {
  const path = window.location.pathname.replace(/\/+$/, '')
  return KNOWN.has(path) ? path as RoutePath : ROUTES.playground
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATE, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATE, onChange)
  }
}

export const useRoute = () => useSyncExternalStore(subscribe, readRoute, () => ROUTES.playground)

export const href = (path: RoutePath) => path

/** Intercept regular internal clicks; leave new tabs, downloads and anchors native. */
export const followSiteLink = (event: MouseEvent<HTMLElement>) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const anchor = event.target instanceof Element ? event.target.closest('a') : null
  if (!anchor || !anchor.hasAttribute('href') || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
  const url = new URL(anchor.href)
  if (url.origin !== window.location.origin || !KNOWN.has(url.pathname)) return
  if (url.pathname === window.location.pathname && url.hash) return
  event.preventDefault()
  if (url.href === window.location.href) return
  window.history.pushState(null, '', url)
  window.dispatchEvent(new Event(NAVIGATE))
}
