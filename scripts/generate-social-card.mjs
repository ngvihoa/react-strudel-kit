import { createServer } from 'vite'
import { chromium } from '@playwright/test'

// Manual asset generation only; the production build needs no browser binary.
const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' })
let browser
try {
  await server.listen()
  const { port } = server.httpServer.address()
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(`http://127.0.0.1:${port}/scripts/social-card.html`)
  await page.evaluate(() => document.fonts.ready)
  await page.locator('img').evaluate((image) => image.decode())
  await page.screenshot({ path: 'public/og-image.png' })
  console.log('Generated public/og-image.png (1200 × 630)')
} finally {
  await browser?.close()
  await server.close()
}
