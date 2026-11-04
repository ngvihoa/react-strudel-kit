# Website SEO

This is website infrastructure, not npm package content.

## Routes and metadata

`src/site/metadata.ts` owns the production origin, page names, descriptions and
social metadata. `PAGE_INFO` must cover every `RoutePath`; adding a route without
metadata fails typecheck. Canonicals and `og:url` always use
`https://react-strudel-kit.vercel.app`, without query strings or fragments.
Change `SITE_URL` there if the production domain changes.

`usePageMetadata` updates the same tags after client navigation and removes stale
canonicals/JSON-LD. Preview builds with `VERCEL_ENV=preview` emit `noindex, follow`.
Missing routes also emit noindex, with no canonical pointing at the home page.

JSON-LD describes the WebSite and SoftwareSourceCode on home, TechArticle and
BreadcrumbList on documentation, and WebPage on the Playground. It does not add
fictional ratings, users, authors or publication dates.

## Static rendering and deployment

`npm run build` builds the client, then `scripts/prerender.mjs` builds a temporary
Vite SSR entry and renders the same Site into one HTML file per public route.
The temporary server bundle is removed afterward. No server runtime or browser
binary is required in production. Content and metadata are available without
JavaScript; the client hydrates it to enable controls and navigation.

The initial route is supplied to the server snapshot and client hydration. Legacy
hash bookmarks that resolve to a different page use a fresh client render instead
of hydrating the wrong article. The Playground never reads server-side storage.

Generated output includes `index.html`, `docs.html`, `docs/installation.html`,
other route documents, `404.html`, `robots.txt`, `sitemap.xml` and `_redirects`.
The sitemap lists only actual public routes. No synthetic `lastmod`, `priority`
or `changefreq` values are generated. Robots allows crawling of content and assets
and points to the production sitemap; preview noindex is expressed in metadata.

Vercel uses `cleanUrls: true` and `trailingSlash: false` to serve the corresponding
HTML document and its native 404 fallback. Do not restore a catch-all rewrite
returning `index.html` with status 200. The generated Netlify-style `_redirects`
contains explicit known-route rewrites and a final status-404 fallback. Other
hosts must serve clean route documents and use `404.html` with HTTP 404.

`npm run preview` follows the same clean-document and 404 behavior for testing;
Vite dev retains its normal SPA fallback. A nonexistent route still renders the
not-found UI in dev, but production/preview HTTP status is the SEO contract.

## Social image

`public/og-image.png` is a committed 1200 × 630 image built from the existing logo,
local brand fonts and the source in `scripts/social-card.html`. It is shared by
Open Graph and Twitter cards. To regenerate it after brand/copy changes:

```bash
npx playwright install chromium
node scripts/generate-social-card.mjs
```

An existing browser binary can be selected using
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Generation is manual and is not part of the
production build. No new picture service or remote font dependency is involved.

## Verification and publishing

The SEO browser tests inspect every document with JavaScript disabled, check
metadata changes after navigation, parse JSON-LD/sitemap, verify PNG dimensions,
and test missing URLs and canonical redirects. The existing browser suite checks
hydration, music controls, route cleanup, legacy bookmarks and responsive layout.

After deploying, verify home and a nested article's raw HTML, `/sitemap.xml`,
`/robots.txt`, `/og-image.png` and a deliberately missing URL's HTTP 404. Then the
owner can verify the production property in Google Search Console and submit
`https://react-strudel-kit.vercel.app/sitemap.xml`. Verification tokens must come
from the owner's property; none are fabricated or installed by this change.
No deployment or Search Console submission is performed by a local build.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[Vite static pre-rendering](https://vite.dev/guide/ssr.html#pre-rendering-ssg),
[Vercel clean URLs](https://vercel.com/docs/project-configuration/vercel-json#cleanurls),
[Vercel custom 404](https://vercel.com/kb/guide/custom-404-page).
