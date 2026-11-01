import { useSyncExternalStore } from 'react'

// Hash routes keep the reference app a static Vite build without a router dependency.
export const ROUTES = {
  lesson: '/learn/first-song',
  cookbook: '/cookbook/kick',
  example: '/examples/dance-monkey',
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
