import { useEffect } from 'react'
import { getMetadata } from './metadata'
import type { RoutePath } from './router'

export function usePageMetadata(route: RoutePath | null) {
  useEffect(() => {
    const { title, tags } = getMetadata(route)
    document.title = title
    document.head.querySelectorAll('[data-seo]').forEach((element) => element.remove())
    for (const { tag, attributes, text } of tags) {
      const element = document.createElement(tag)
      element.dataset.seo = ''
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
      if (text) element.textContent = text
      document.head.append(element)
    }
  }, [route])
}
