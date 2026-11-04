import { act, renderHook } from '@testing-library/react'
import type { MouseEvent } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { ROUTES, followSiteLink, href, migrateLegacyRoute, useRoute } from './router'

beforeEach(() => window.history.replaceState(null, '', '/'))

const click = (attributes: Record<string, string | undefined>, modifiers = {}) => {
  const anchor = document.createElement('a')
  for (const [name, value] of Object.entries(attributes)) if (value !== undefined) anchor.setAttribute(name, value)
  const event = { target: anchor, button: 0, defaultPrevented: false, preventDefault: vi.fn(), ...modifiers }
  act(() => followSiteLink(event as unknown as MouseEvent<HTMLElement>))
  return event
}

it('uses path URLs and updates mounted consumers through browser history', () => {
  const { result } = renderHook(useRoute)
  expect(result.current).toBe(ROUTES.home)
  const event = click({ href: href(ROUTES.lofi) })
  expect(event.preventDefault).toHaveBeenCalledOnce()
  expect(window.location.pathname).toBe(ROUTES.lofi)
  expect(window.location.hash).toBe('')
  expect(result.current).toBe(ROUTES.lofi)
})

it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }])(
  'leaves modified and already handled clicks native: %o', (modifiers) => {
    expect(click({ href: ROUTES.lofi }, modifiers).preventDefault).not.toHaveBeenCalled()
    expect(window.location.pathname).toBe('/')
  },
)

it.each([{ href: ROUTES.lofi, target: '_blank' }, { href: ROUTES.lofi, download: '' }, { href: 'https://example.com/examples/lofi-loop' }])(
  'preserves new tabs, downloads and external links: %o', (attributes) => {
    expect(click(attributes).preventDefault).not.toHaveBeenCalled()
  },
)

it('leaves section anchors native', () => {
  window.history.replaceState(null, '', ROUTES.lofi)
  expect(click({ href: '#chords' }).preventDefault).not.toHaveBeenCalled()
})

it('replaces legacy hash bookmarks while preserving the query and history state', () => {
  window.history.replaceState({ restored: true }, '', '/?source=old#/examples/lofi-loop')
  migrateLegacyRoute()
  expect(window.location.pathname).toBe(ROUTES.lofi)
  expect(window.location.search).toBe('?source=old')
  expect(window.location.hash).toBe('')
  expect(window.history.state).toEqual({ restored: true })
})

it('does not turn section anchors or unknown hashes into routes', () => {
  window.history.replaceState(null, '', '/api#compose')
  migrateLegacyRoute()
  expect(window.location.pathname + window.location.hash).toBe('/api#compose')
  window.history.replaceState(null, '', '/#/unknown')
  migrateLegacyRoute()
  expect(window.location.pathname + window.location.hash).toBe('/#/unknown')
})
