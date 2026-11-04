import { afterEach, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { getMetadata, PAGE_INFO, renderMetadata, safeJson, SITE_URL } from './metadata'
import { ROUTES } from './router'
import type { RoutePath } from './router'
import { usePageMetadata } from './usePageMetadata'

afterEach(() => document.head.querySelectorAll('[data-seo]').forEach((element) => element.remove()))

it('gives every public route distinct, complete metadata and one production canonical', () => {
  const titles = new Set<string>()
  const descriptions = new Set<string>()
  for (const route of Object.values(ROUTES)) {
    const metadata = getMetadata(route)
    const template = document.createElement('template')
    template.innerHTML = renderMetadata(route)
    const head = template.content
    expect(head.querySelectorAll('title')).toHaveLength(1)
    expect(head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(SITE_URL + route)
    expect(head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(SITE_URL + route)
    expect(head.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image')
    const graph = JSON.parse(head.querySelector('script')!.textContent!)['@graph']
    expect(graph.some((entity: Record<string, unknown>) => entity.url === SITE_URL + route)).toBe(true)
    expect(PAGE_INFO[route].description.length).toBeGreaterThan(70)
    titles.add(metadata.title)
    descriptions.add(metadata.description)
  }
  expect(titles.size).toBe(Object.values(ROUTES).length)
  expect(descriptions.size).toBe(Object.values(ROUTES).length)
})

it('keeps unknown pages out of the index without canonicalizing them to the home page', () => {
  const template = document.createElement('template')
  template.innerHTML = renderMetadata(null)
  expect(template.content.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow')
  expect(template.content.querySelector('link[rel="canonical"]')).toBeNull()
  expect(template.content.querySelector('script[type="application/ld+json"]')).toBeNull()
})

it('updates and removes route metadata without leaving duplicate canonicals or stale structured data', () => {
  const { rerender } = renderHook(({ route }: { route: RoutePath | null }) => usePageMetadata(route), { initialProps: { route: ROUTES.home as RoutePath | null } })
  rerender({ route: ROUTES.lofi })
  expect(document.title).toContain('Lo-fi loop')
  expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
  expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(SITE_URL + ROUTES.lofi)
  expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1)
  rerender({ route: null })
  expect(document.title).toContain('Page not found')
  expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
  expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull()
})

it('escapes JSON-LD script delimiters without changing its data', () => {
  const payload = { description: '</script><script>alert("&")</script>' }
  expect(safeJson(payload)).not.toContain('<')
  expect(JSON.parse(safeJson(payload))).toEqual(payload)
})
