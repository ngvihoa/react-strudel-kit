import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ROUTES } from '../src/site/router'

const routes = Object.values(ROUTES)
const titles: Record<string, string> = {
  [ROUTES.home]: 'Make music with React.',
  [ROUTES.docs]: 'Make music with code',
  [ROUTES.firstSong]: 'Your first song',
  [ROUTES.makeBeat]: 'Make a beat',
  [ROUTES.addBass]: 'Add a bass line',
  [ROUTES.layerParts]: 'Layer the parts',
  [ROUTES.controlReact]: 'Control it with React',
  [ROUTES.kick]: 'Kick', [ROUTES.snare]: 'Snare', [ROUTES.hiHat]: 'Hi-hat',
  [ROUTES.bass]: 'Bass', [ROUTES.keys]: 'Keys', [ROUTES.lead]: 'Lead', [ROUTES.pad]: 'Pad',
  [ROUTES.simpleMelody]: 'A simple melody', [ROUTES.fourOnTheFloor]: 'Four on the floor',
  [ROUTES.backbeat]: 'Backbeat', [ROUTES.hiHatAccents]: 'Hi-hat accents',
  [ROUTES.bassLine]: 'Bass line', [ROUTES.chords]: 'Chords and arpeggios',
  [ROUTES.layerASong]: 'Layer a song', [ROUTES.reactMixer]: 'Control it with React',
  [ROUTES.lofi]: 'Lo-fi loop', [ROUTES.house]: 'House loop',
  [ROUTES.danceMonkey]: 'Dance Monkey', [ROUTES.api]: 'API reference', [ROUTES.playground]: 'Dance Monkey',
}
const runtimeErrors = new WeakMap<Page, string[]>()
const go = async (page: Page, route: string) => {
  await page.evaluate((path) => { window.history.pushState(null, '', path); window.dispatchEvent(new PopStateEvent('popstate')) }, route)
  await expect(page.locator('h1')).toHaveText(titles[route])
  await expect(page.getByRole('navigation', { name: 'Sections', exact: true }).locator('[aria-current="page"]')).toHaveAttribute('href',
    route === ROUTES.home || route === ROUTES.playground ? route : ROUTES.docs)
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  runtimeErrors.set(page, errors)
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(ROUTES.firstSong)
  await expect(page.locator('h1')).toHaveText('Your first song')
})

// Scheduler and synthesis failures can arrive after the Play promise resolves.
test.afterEach(async ({ page }) => { expect(runtimeErrors.get(page)).toEqual([]) })

test('every nested route supports a direct visit and a document reload', async ({ page }) => {
  for (const route of routes) {
    const visit = await page.goto(route)
    expect(visit?.status(), route).toBe(200)
    await expect(page.locator('h1')).toHaveText(titles[route])
    const reload = await page.reload()
    expect(reload?.request().resourceType()).toBe('document')
    expect(reload?.status(), route).toBe(200)
    await expect(page.locator('h1')).toHaveText(titles[route])
    expect(new URL(page.url()).hash).toBe('')
    await expect(page.locator('.player-playing')).toHaveCount(0)
  }
})

test('landing presents installation first, plays full sessions and cleans up on navigation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await go(page, ROUTES.home)
  const hero = page.locator('.landing-hero')
  await expect(hero.getByText('react-strudel-kit', { exact: true })).toBeVisible()
  const install = hero.getByRole('button', { name: 'Copy install command' })
  expect((await install.boundingBox())!.y).toBeLessThan(1000)
  await expect(page.locator('.landing')).toHaveAttribute('data-hero-state', 'static')
  expect(await hero.locator('h1 span').first().evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  const demo = page.getByRole('region', { name: / session player$/ })
  await expect(demo.locator('.player-state')).toHaveText('Ready')
  await page.getByRole('button', { name: 'House', exact: true }).click()
  await expect(demo).toHaveAttribute('aria-label', 'House session player')
  await expect(demo.locator('.player-state')).toHaveText('Ready')
  await demo.getByRole('button', { name: 'Play House session' }).click()
  await expect(demo.locator('.player-state')).toHaveText('Playing')
  await page.getByRole('button', { name: 'Lo-fi', exact: true }).click()
  await expect(demo).toHaveAttribute('aria-label', 'Lo-fi session player')
  await expect(demo.locator('.player-state')).toHaveText('Playing')
  await demo.getByRole('slider', { name: /Listening level/ }).fill('50')
  await page.getByRole('button', { name: 'Strudel output', exact: true }).click()
  await expect(page.locator('.session-code pre')).toContainText('velocity(0.5)')
  await expect(page.locator('.session-code pre')).toContainText('cpm(20)')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await demo.getByRole('button', { name: 'Stop Lo-fi session' }).click()
  await expect(demo.locator('.player-state')).toHaveText('Ready')
  await install.click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install react-strudel-kit')
  await expect(hero.getByRole('button', { name: 'Copied install command' })).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await demo.getByRole('button', { name: 'Play Lo-fi session' }).click()
  await expect(demo.locator('.player-state')).toHaveText('Playing')
  await hero.getByRole('link', { name: 'Get started', exact: true }).click()
  await expect(page.locator('h1')).toHaveText('Your first song')
  await expect(page.locator('.player-playing')).toHaveCount(0)
})

test('Docs section index stays on the right while scrolling and supports keyboard jumps', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const rail = page.getByRole('complementary', { name: 'Quick access' })
  await expect(rail).toBeVisible()
  expect(await rail.evaluate((element) => getComputedStyle(element).position)).toBe('sticky')
  const article = await page.locator('.docs-main').boundingBox()
  expect((await rail.boundingBox())!.x).toBeGreaterThanOrEqual(article!.x + article!.width)
  await page.evaluate(() => window.scrollTo(0, 700))
  await expect.poll(async () => (await rail.boundingBox())!.y).toBe(60)
  await rail.getByRole('link', { name: 'Set the tempo', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(rail.getByRole('link', { name: 'Set the tempo', exact: true })).toHaveAttribute('aria-current', 'location')
  await expect(page.getByRole('heading', { name: 'Set the tempo', exact: true })).toBeInViewport()
  await go(page, ROUTES.api)
  await expect(rail.getByRole('link', { name: 'Modifiers', exact: true })).toBeVisible()
})

test('old hash bookmarks become clean URLs and survive reload', async ({ page }) => {
  await page.goto('/?source=bookmark#/examples/lofi-loop')
  await expect(page).toHaveURL(/\/examples\/lofi-loop\?source=bookmark$/)
  await expect(page.locator('h1')).toHaveText('Lo-fi loop')
  await page.reload()
  await expect(page.locator('h1')).toHaveText('Lo-fi loop')
})

test('Back and Forward retain the page and stop its playback', async ({ page }) => {
  await page.goto(ROUTES.lofi)
  await page.getByRole('button', { name: 'Play Jazzy chords', exact: true }).click()
  await expect(page.locator('.player-playing')).toHaveCount(1)
  await page.getByRole('navigation', { name: 'Sections', exact: true }).getByRole('link', { name: 'Docs', exact: true }).click()
  await expect(page.locator('h1')).toHaveText('Make music with code')
  await page.goBack()
  await expect(page.locator('h1')).toHaveText('Lo-fi loop')
  await expect(page.locator('.player-playing')).toHaveCount(0)
  await page.goForward()
  await expect(page.locator('h1')).toHaveText('Make music with code')
})

for (const width of [375, 768, 1440, 1920]) {
  test(`all routes fit at ${width}px and link to available pages`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await go(page, route)
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      expect(await page.locator('.site-main').evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(1280)
      const links = await page.locator('a[href^="/"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href')!))
      expect(links.every((link) => routes.includes(link as typeof routes[number]))).toBe(true)
    }
    for (const route of [...routes.filter((path) => path.startsWith('/learn/')), ROUTES.kick]) {
      await go(page, route)
      await page.screenshot({ path: testInfo.outputPath(`${route.split('/').at(-1)}-${width}.png`), animations: 'disabled' })
    }
  })
}

for (const width of [375, 1440]) {
  test(`all pages pass automated accessibility checks at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const route of routes) {
      await go(page, route)
      // Audit all content fully visible; normal-motion behavior has separate coverage.
      await page.evaluate(() => document.fonts.ready)
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations, route).toEqual([])
    }
  })
}

test('mobile navigation disclosures work by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  const menu = page.locator('.section-nav-narrow')
  await menu.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('open', '')
  await expect(menu.getByRole('link')).toHaveCount(routes.length - 2)
  await page.getByRole('navigation', { name: 'Sections', exact: true }).getByRole('link', { name: 'Docs', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('h1')).toHaveText('Make music with code')
  await menu.locator('summary').focus()
  await page.keyboard.press('Enter')
  await menu.getByRole('link', { name: 'Snare', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('h1')).toHaveText('Snare')
  await expect(page.locator('.player-playing')).toHaveCount(0)
})

test('skip link moves keyboard focus and preserves the lesson route', async ({ page }) => {
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page).toHaveURL(/\/learn\/first-song$/)
  await expect(page.locator('h1')).toHaveText('Your first song')
})

const customPlayers = new Set<string>([ROUTES.home, ROUTES.docs, ROUTES.api, ROUTES.playground, ROUTES.reactMixer, ROUTES.controlReact])
for (const route of [ROUTES.makeBeat, ROUTES.addBass, ROUTES.layerParts, ROUTES.controlReact]) {
  test(`${route}: lesson layout and accessibility`, async ({ page }, testInfo) => {
    await go(page, route)
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.screenshot({ path: testInfo.outputPath(`lesson-${width}.png`), animations: 'disabled' })
    }
  })
  if (route === ROUTES.controlReact) continue
  test(`${route}: practice controls update live and reload resets them`, async ({ page }) => {
    await go(page, route)
    const practice = page.locator('.player').last()
    const tempo = practice.getByRole('slider', { name: /Tempo/ })
    await tempo.focus()
    await page.keyboard.press('ArrowRight')
    await expect(tempo).toHaveValue('101')
    await expect(practice.locator('.player-state')).toHaveText('Ready')
    await practice.getByRole('button', { name: /^Play / }).click()
    await expect(practice.locator('.player-state')).toHaveText('Playing')
    const level = practice.getByRole('slider').last()
    const nextLevel = Number((Number(await level.inputValue()) - Number(await level.getAttribute('step'))).toFixed(2))
    await level.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(level).toHaveValue(String(nextLevel))
    await expect(practice.locator('.player-state')).toHaveText('Playing')
    await page.getByRole('button', { name: 'Strudel output', exact: true }).last().click()
    await expect(page.locator('pre').last()).toContainText('cpm(25.25)')
    await expect(page.locator('pre').last()).toContainText(route === ROUTES.makeBeat ? `velocity("[1 ${nextLevel}]*4")` : `velocity(${nextLevel})`)
    await practice.getByRole('button', { name: 'Reset controls', exact: true }).click()
    await expect(tempo).toHaveValue('100')
    await expect(practice.locator('.player-state')).toHaveText('Playing')
    await page.reload()
    await expect(page.locator('.player').last().getByRole('slider', { name: /Tempo/ })).toHaveValue('100')
    await expect(page.locator('.player-playing')).toHaveCount(0)
  })
}
for (const route of routes.filter((route) => !customPlayers.has(route))) {
  test(`${route}: every pattern plays and stops with the real engine`, async ({ page }) => {
    await go(page, route)
    const players = page.getByRole('region', { name: / player$/ })
    for (const player of await players.all()) {
      await player.getByRole('button', { name: /^Play / }).click()
      await expect(player.locator('.player-state')).toHaveText('Playing')
      await expect(page.getByRole('alert')).toHaveCount(0)
      await player.getByRole('button', { name: /^Stop / }).click()
      await expect(player.locator('.player-state')).toHaveText('Ready')
    }
  })
}

test('keyboard controls update the playing sound and never autoplay while stopped', async ({ page }) => {
  await go(page, ROUTES.kick)
  const player = page.getByRole('region', { name: 'Kick on its own player' })
  const slider = player.getByRole('slider', { name: /Pitch drop/ })
  await slider.focus()
  const initial = Number(await slider.inputValue())
  await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveValue(String(initial + 1))
  await expect(player.locator('.player-state')).toHaveText('Ready')
  await expect(slider).toBeFocused()
  expect(await slider.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid')

  await player.getByRole('button', { name: 'Play Kick on its own', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(player.locator('.player-state')).toHaveText('Playing')
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await expect(player.locator('.player-state')).toHaveText('Playing')
  await page.getByRole('button', { name: 'Strudel output', exact: true }).first().click()
  await expect(page.locator('pre').filter({ hasText: `penv(${initial + 2})` })).toHaveCount(1)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await player.getByRole('button', { name: 'Stop Kick on its own', exact: true }).focus()
  await page.keyboard.press('Enter')
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await expect(player.locator('.player-state')).toHaveText('Ready')
})

test('only the player that started the transport owns playback', async ({ page }) => {
  const one = page.getByRole('region', { name: 'One note player', exact: true })
  const four = page.getByRole('region', { name: 'Four notes player', exact: true })
  await one.getByRole('button', { name: /^Play / }).click()
  await expect(one.locator('.player-state')).toHaveText('Playing')
  await four.getByRole('button', { name: /^Play / }).click()
  await expect(four.locator('.player-state')).toHaveText('Playing')
  await expect(one.locator('.player-state')).toHaveText('Ready')
  await one.getByRole('button', { name: /^Stop / }).click()
  await expect(four.locator('.player-state')).toHaveText('Playing')
  await four.getByRole('button', { name: /^Stop / }).click()
})

for (const route of [ROUTES.reactMixer, ROUTES.controlReact]) test(`${route}: React controls and route changes share the transport with Playground`, async ({ page }) => {
  await go(page, route)
  const mixer = page.locator('.react-mixer')
  await expect(page.locator('.player')).toHaveCount(0)
  await mixer.getByRole('checkbox', { name: 'melody' }).uncheck()
  await expect(mixer.locator('output')).toHaveText('idle')
  await mixer.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(mixer.locator('output')).toHaveText('playing')
  await mixer.getByRole('slider').focus()
  await page.keyboard.press('ArrowRight')
  await mixer.getByRole('checkbox', { name: 'bass' }).uncheck()
  await expect(mixer.locator('output')).toHaveText('playing')
  await mixer.getByRole('checkbox', { name: 'drums' }).uncheck()
  await mixer.getByRole('checkbox', { name: 'chords' }).uncheck()
  await expect(mixer.locator('output')).toHaveText('playing')
  await expect(page.getByRole('alert')).toHaveCount(0)

  await page.getByRole('navigation', { name: 'Sections', exact: true }).getByRole('link', { name: 'Playground', exact: true }).click()
  const status = page.locator('.topbar-note')
  await expect(status).toHaveText('Ready')
  await page.getByRole('button', { name: 'Play mix', exact: true }).focus()
  await page.keyboard.press('Control+Enter')
  await expect(status).toHaveText('Playing')
  await page.keyboard.press('Escape')
  await expect(status).toHaveText('Ready')
  await page.getByRole('button', { name: 'Code editor', exact: true }).click()
  await page.getByRole('textbox', { name: 'Strudel pattern code' }).fill('note("c4 e4").s("triangle").gain(0.2)')
  await expect(status).toHaveText('Ready')
  await page.keyboard.press('Control+Enter')
  await expect(status).toHaveText('Playing')
  await page.keyboard.press('Escape')
  await expect(status).toHaveText('Ready')
})

test('first Play resumes audio before a slow runtime download and reuses it afterwards', async ({ page }) => {
  await page.addInitScript(() => {
    const resume = AudioContext.prototype.resume
    Object.assign(window, { audioResumes: 0 })
    AudioContext.prototype.resume = function () {
      const state = window as unknown as { audioResumes: number }
      state.audioResumes++
      return resume.call(this)
    }
  })
  await page.reload()
  const runtimeLoaded = () => page.evaluate(() => 'initStrudel' in window)
  expect(await runtimeLoaded()).toBe(false)

  let release!: () => void
  let downloads = 0
  const downloading = new Promise<void>((resolve) => { release = resolve })
  await page.route('**/assets/*.js', async (route) => {
    downloads++
    await downloading
    await route.continue()
  })
  const player = page.getByRole('region', { name: 'One note player', exact: true })
  try {
    await player.getByRole('button', { name: 'Play One note', exact: true }).click()
    await expect(player.locator('.player-state')).toHaveText('Starting audio…')
    await expect.poll(() => downloads).toBeGreaterThan(0)
    expect(await page.evaluate(() => (window as unknown as { audioResumes: number }).audioResumes)).toBe(1)
    expect(await runtimeLoaded()).toBe(false)
  } finally {
    release()
  }

  await expect(player.locator('.player-state')).toHaveText('Playing')
  expect(await runtimeLoaded()).toBe(true)
  const completedDownloads = downloads
  await player.getByRole('button', { name: 'Stop One note', exact: true }).click()
  await player.getByRole('button', { name: 'Play One note', exact: true }).click()
  await expect(player.locator('.player-state')).toHaveText('Playing')
  expect(downloads).toBe(completedDownloads)
  await player.getByRole('button', { name: 'Stop One note', exact: true }).click()
})

for (const action of ['Stop', 'route change']) {
  test(`${action} cancels Play while audio resume is pending`, async ({ page }) => {
    await page.addInitScript(() => {
      const resume = AudioContext.prototype.resume
      let release!: () => void
      const gate = new Promise<void>((resolve) => { release = resolve })
      Object.assign(window, { releaseAudioResume: release })
      AudioContext.prototype.resume = async function () {
        await resume.call(this)
        await gate
      }
    })
    await page.reload()
    await page.getByRole('button', { name: 'Play One note', exact: true }).click()
    await expect(page.getByRole('region', { name: 'One note player', exact: true }).locator('.player-state')).toHaveText('Starting audio…')
    if (action === 'Stop') await page.getByRole('button', { name: 'Stop One note', exact: true }).click()
    else await go(page, ROUTES.playground)
    await page.evaluate(() => (window as unknown as { releaseAudioResume: () => void }).releaseAudioResume())
    if (action === 'Stop') {
      await expect(page.getByRole('region', { name: 'One note player', exact: true }).locator('.player-state')).toHaveText('Ready')
    } else await expect(page.locator('.topbar-note')).toHaveText('Ready')
    // A fresh gesture must still work after the cancelled request drains.
    const play = page.getByRole('button', { name: action === 'Stop' ? 'Play One note' : 'Play mix', exact: true })
    await play.click()
    await expect(action === 'Stop' ? page.getByRole('region', { name: 'One note player', exact: true }).locator('.player-state') : page.locator('.topbar-note')).toHaveText('Playing')
    await page.getByRole('button', { name: action === 'Stop' ? 'Stop One note' : 'Stop', exact: true }).click()
  })
}
