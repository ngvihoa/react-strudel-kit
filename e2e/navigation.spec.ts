import { expect, test } from '@playwright/test'

test('Introduction leads through Installation to a source-backed React player and the lessons', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/docs')
  await expect(page.locator('h1')).toHaveText('Introduction')
  const navigation = page.locator('.section-nav-wide')
  await expect(navigation.getByRole('link').nth(0)).toHaveText('Introduction')
  await expect(navigation.getByRole('link').nth(1)).toHaveText('Installation')
  await navigation.getByRole('link', { name: 'Installation', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/docs\/installation$/)
  await expect(page.locator('h1')).toHaveText('Installation')
  await expect(page.getByRole('complementary', { name: 'Quick access' }).getByRole('link', { name: 'Install the package', exact: true })).toBeVisible()
  await page.locator('.code-block').first().getByRole('button', { name: 'Copy code' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install react-strudel-kit')
  await expect(page.locator('pre').nth(1)).toContainText('export function GettingStarted()')
  const player = page.getByRole('group', { name: 'First pattern player' })
  await expect(player.locator('output')).toHaveText('idle')
  await player.getByRole('button', { name: 'Play', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(player.locator('output')).toHaveText('playing')
  await player.getByRole('button', { name: 'Stop', exact: true }).click()
  await expect(player.locator('output')).toHaveText('idle')
  await player.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(player.locator('output')).toHaveText('playing')
  await page.getByRole('navigation', { name: 'Previous and next' }).getByRole('link', { name: /Next.*Your first song/ }).click()
  await expect(page.locator('h1')).toHaveText('Your first song')
  await expect(page.locator('.player-playing')).toHaveCount(0)
  await page.goBack()
  await expect(page.locator('h1')).toHaveText('Installation')
  await expect(player.locator('output')).toHaveText('idle')
  expect(errors).toEqual([])
})

test('project links remain accessible at small and large widths; Docs footer stays beside the sidebar', async ({ page }) => {
  await page.goto('/docs')
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    const links = page.getByRole('navigation', { name: 'Package links' })
    await expect(links.getByRole('link', { name: 'GitHub repository' })).toHaveAttribute('href', 'https://github.com/ngvihoa/react-strudel-kit')
    await expect(links.getByRole('link', { name: 'npm package' })).toHaveAttribute('href', 'https://www.npmjs.com/package/react-strudel-kit')
    for (const link of await links.getByRole('link').all()) {
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('target', '_blank')
    }
    await expect(page.getByRole('navigation', { name: 'Sections', exact: true }).getByRole('link', { name: 'Playground' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  const footer = page.locator('.docs-content > .site-footer')
  await expect(footer).toBeInViewport()
  const sidebar = (await page.locator('.docs-nav').boundingBox())!
  expect((await footer.boundingBox())!.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width)
  await expect(page.locator('.site-footer')).toHaveCount(1)
  await expect(page.locator('.section-nav-wide .section-nav-group > p svg')).toHaveCount(5)
})

test('a long section jump selects only its destination and manual scrolling resumes scrollspy', async ({ page }) => {
  await page.goto('/api')
  const toc = page.locator('.docs-quick-access .toc')
  await expect(toc.locator('[aria-current="location"]')).toHaveAttribute('href', '#entrypoints')
  await toc.evaluate((element) => {
    const changes: string[] = []
    const observer = new MutationObserver(() => {
      const href = element.querySelector('[aria-current="location"]')?.getAttribute('href')
      if (href && changes.at(-1) !== href) changes.push(href)
    })
    observer.observe(element, { subtree: true, attributes: true, attributeFilter: ['aria-current'] })
    Object.assign(window, { sectionChanges: changes })
  })
  await toc.getByRole('link', { name: 'Limits', exact: true }).click()
  await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY + window.innerHeight - document.documentElement.scrollHeight))).toBeLessThan(2)
  expect(await page.evaluate(() => (window as unknown as { sectionChanges: string[] }).sectionChanges)).toEqual(['#limits'])
  await page.mouse.wheel(0, -100000)
  await expect(toc.locator('[aria-current="location"]')).toHaveAttribute('href', '#entrypoints')
  // A second click and a wheel gesture must cancel the old destination lock.
  await toc.getByRole('link', { name: 'Limits', exact: true }).click()
  await page.mouse.wheel(0, -100000)
  await expect(toc.locator('[aria-current="location"]')).toHaveAttribute('href', '#entrypoints')
  await toc.getByRole('link', { name: 'Modifiers', exact: true }).click()
  await toc.getByRole('link', { name: 'Entrypoints', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(200)
  await expect(toc.locator('[aria-current="location"]')).toHaveAttribute('href', '#entrypoints')
})
