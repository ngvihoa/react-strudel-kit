import { useSyncExternalStore } from 'react'

// Hash routes keep the reference app a static Vite build without a router dependency.
export const ROUTES = {
  firstSong: '/learn/first-song',
  kick: '/cookbook/kick',
  snare: '/cookbook/snare',
  hiHat: '/cookbook/hi-hat',
  simpleMelody: '/examples/simple-melody',
  fourOnTheFloor: '/examples/four-on-the-floor',
  backbeat: '/examples/backbeat',
  hiHatAccents: '/examples/hi-hat-accents',
  danceMonkey: '/examples/dance-monkey',
  playground: '/playground',
} as const

export type RoutePath = typeof ROUTES[keyof typeof ROUTES]

const KNOWN = new Set<string>(Object.values(ROUTES))

const readRoute = (): RoutePath => {
  const path = window.location.hash.replace(/^#/, '')
  return KNOWN.has(path) ? path as RoutePath : ROUTES.playground
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export const useRoute = () => useSyncExternalStore(subscribe, readRoute, () => ROUTES.playground)

export const href = (path: RoutePath) => `#${path}`
