import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import '@fontsource/be-vietnam-pro/600.css'
import '@fontsource/be-vietnam-pro/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './index.css'
import { Site } from './site/Site'
import { migrateLegacyRoute, resolveRoute } from './site/router'

migrateLegacyRoute()
const root = document.getElementById('root')!
const initialRoute = resolveRoute(window.location.pathname)
const app = (
  <StrictMode>
    <Site initialRoute={initialRoute} />
  </StrictMode>
)
// Legacy hash bookmarks may point at a different article than the initial HTML.
if (root.dataset.route === (initialRoute ?? '404')) hydrateRoot(root, app)
else createRoot(root).render(app)
