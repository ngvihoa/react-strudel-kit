import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const output = resolve('dist')
const temporary = resolve('.prerender')
const template = await readFile(resolve(output, 'index.html'), 'utf8')
if (!template.includes('<!--seo-head-->') || !template.includes('<!--app-html-->')) {
  throw new Error('Missing prerender markers in the client HTML template')
}

try {
  await build({ build: { ssr: 'src/entry-server.tsx', outDir: temporary, emptyOutDir: true }, ssr: { noExternal: ['react-strudel-kit'] } })
  const { routes, render, SITE_URL } = await import(pathToFileURL(resolve(temporary, 'entry-server.js')).href)
  for (const route of [...routes, null]) {
    const { html, head } = render(route)
    const document = template
      .replace('<!--seo-head-->', () => head)
      .replace('<!--app-html-->', () => html)
      .replace('<div id="root">', () => `<div id="root" data-route="${route ?? '404'}">`)
    const file = resolve(output, route === null ? '404.html' : route === '/' ? 'index.html' : `${route.slice(1)}.html`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, document)
  }
  const urls = routes.map((route) => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n')
  await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
  await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
  // Netlify-style hosts need explicit document rewrites, never a 200 home-page fallback.
  const rewrites = routes.filter((route) => route !== '/').map((route) => `${route} ${route}.html 200`).join('\n')
  await writeFile(resolve(output, '_redirects'), `${rewrites}\n/* /404.html 404\n`)
  console.log(`Prerendered ${routes.length} public pages, 404.html, sitemap.xml and robots.txt`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
