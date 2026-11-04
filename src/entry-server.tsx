import { renderToString } from 'react-dom/server'
import { StrictMode } from 'react'
import { Site } from './site/Site'
import { ROUTES } from './site/router'
import type { RoutePath } from './site/router'
import { renderMetadata, SITE_URL } from './site/metadata'

export const routes = Object.values(ROUTES)
export { SITE_URL }

export function render(route: RoutePath | null) {
  return { html: renderToString(<StrictMode><Site initialRoute={route} /></StrictMode>), head: renderMetadata(route) }
}
