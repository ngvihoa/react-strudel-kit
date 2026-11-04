import { expect, test } from '@playwright/test'
import { ROUTES } from '../src/site/router'
import { PAGE_INFO, SITE_URL } from '../src/site/metadata'

test('every public page ships readable content and complete metadata without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  for (const route of Object.values(ROUTES)) {
    const response = await page.goto(`http://127.0.0.1:4173${route}`)
    expect(response?.status(), route).toBe(200)
    await expect(page.locator('#root')).toHaveAttribute('data-route', route)
    await expect(page.locator('h1')).toBeVisible()
    expect((await page.locator('main').textContent())!.length, route).toBeGreaterThan(150)
    await expect(page).toHaveTitle(route === ROUTES.home ? `React Strudel Kit — ${PAGE_INFO[route].name}` : `${PAGE_INFO[route].name} | React Strudel Kit`)
    await expect(page.locator('head title')).toHaveCount(1)
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1)
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', PAGE_INFO[route].description)
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', SITE_URL + route)
    await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', SITE_URL + route)
    await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    const graph = JSON.parse((await page.locator('head script[type="application/ld+json"]').textContent())!)['@graph']
    expect(graph.some((entity: Record<string, unknown>) => entity.url === SITE_URL + route)).toBe(true)
  }
  await context.close()
})

test('hydration and client navigation retain one canonical and update the metadata', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/examples/lofi-loop?utm_source=test')
  await expect(page).toHaveTitle('Lo-fi loop example | React Strudel Kit')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL + ROUTES.lofi)
  await page.getByRole('navigation', { name: 'Sections', exact: true }).getByRole('link', { name: 'Docs', exact: true }).click()
  await expect(page).toHaveTitle('Introduction | React Strudel Kit')
  await expect(page.locator('head meta[name="description"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL + ROUTES.docs)
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
  await page.goBack()
  await expect(page).toHaveTitle('Lo-fi loop example | React Strudel Kit')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL + ROUTES.lofi)
  await page.reload()
  await expect(page).toHaveTitle('Lo-fi loop example | React Strudel Kit')
  expect(errors).toEqual([])
})

test('sitemap, robots and the social image match the production public pages', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  const sitemap = await response.text()
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
  expect(locations.sort()).toEqual(Object.values(ROUTES).map((route) => SITE_URL + route).sort())
  expect(sitemap).not.toMatch(/localhost|127\.0\.0\.1|\.html|404|#/)
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
  const image = await request.get('/og-image.png')
  expect(image.status()).toBe(200)
  expect(image.headers()['content-type']).toContain('image/png')
  const png = await image.body()
  expect(png.readUInt32BE(16)).toBe(1200)
  expect(png.readUInt32BE(20)).toBe(630)
})

test('missing URLs return a real 404 and document variants redirect to clean URLs', async ({ page, request }) => {
  const response = await page.goto('/docs/not-a-real-article')
  expect(response?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText('Page not found')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'Open documentation', exact: true }).click()
  await expect(page.locator('h1')).toHaveText('Introduction')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/)
  for (const path of ['/docs/', '/docs.html']) {
    const redirect = await request.get(`${path}?source=test`, { maxRedirects: 0 })
    expect(redirect.status()).toBe(308)
    expect(redirect.headers().location).toBe('/docs?source=test')
  }
  const root = await request.get('/index.html', { maxRedirects: 0 })
  expect(root.status()).toBe(308)
  expect(root.headers().location).toBe('/')
})
