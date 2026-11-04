import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium, expect } from '@playwright/test'

const root = fileURLToPath(new URL('../', import.meta.url))
const work = mkdtempSync(join(tmpdir(), 'react-strudel-kit-consumer-'))
const manifest = JSON.parse(readFileSync(join(root, 'packages/react-strudel-kit/package.json'), 'utf8'))
const installedVersion = (name) => JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8')).version
const run = (command, args, cwd = root) => execFileSync(command, args, {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 180_000,
  maxBuffer: 8 * 1024 * 1024,
})
let success = false
let browser

try {
  assert(relative(root, realpathSync(work)).startsWith('..'), 'Consumer must live outside the workspace')
  // prepack must build the artifact; inspect that exact tarball without rebuilding it.
  run('npm', ['pack', '--workspace=react-strudel-kit', '--pack-destination', work])
  const tarballs = readdirSync(work).filter(name => name.endsWith('.tgz'))
  assert.equal(tarballs.length, 1)
  const tarball = join(work, tarballs[0])
  const [pack] = JSON.parse(run('npm', ['pack', tarball, '--dry-run', '--ignore-scripts', '--json']))
  const files = new Set(pack.files.map(file => file.path))
  for (const path of ['README.md', 'LICENSE', 'CHANGELOG.md', 'src/useStrudel.ts', 'dist/index.js', 'dist/react.js']) assert(files.has(path), `Missing ${path}`)
  for (const entry of Object.values(manifest.exports)) {
    for (const path of Object.values(entry)) assert(files.has(path.replace(/^\.\//, '')), `Missing export ${path}`)
  }
  for (const path of files) {
    assert(!/(?:\.test\.|\.type-test\.|^test\/|^scripts\/|tsconfig|vite\.config)/.test(path), `Unexpected packed file ${path}`)
    assert(/^(?:dist\/|src\/|package\.json$|README\.md$|CHANGELOG\.md$|LICENSE$)/.test(path), `Unexpected packed path ${path}`)
  }
  assert.equal(readFileSync(join(root, 'LICENSE'), 'utf8'), readFileSync(join(root, 'packages/react-strudel-kit/LICENSE'), 'utf8'))
  console.log(`Tarball: ${pack.name}@${pack.version}, ${files.size} files, ${pack.size} bytes, ${pack.integrity}`)

  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ['--mute-audio'],
  })
  const versions = [
    { react: '18.3.1', types: '18.3.31', domTypes: '18.3.7' },
    { react: installedVersion('react'), types: installedVersion('@types/react'), domTypes: installedVersion('@types/react-dom') },
  ]
  for (const version of versions) {
    const app = join(work, `react-${version.react}`)
    cpSync(join(root, 'scripts/fixtures/package-consumer'), app, { recursive: true })
    writeFileSync(join(app, 'package.json'), JSON.stringify({
      name: 'isolated-tarball-consumer', private: true, type: 'module',
      dependencies: {
        [manifest.name]: `file:${tarball}`,
        react: version.react, 'react-dom': version.react,
      },
      devDependencies: {
        '@types/react': version.types, '@types/react-dom': version.domTypes,
        typescript: installedVersion('typescript'), vite: installedVersion('vite'),
      },
    }, null, 2))
    run('npm', ['install', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org'], app)
    const kit = join(app, 'node_modules', manifest.name)
    assert(!lstatSync(kit).isSymbolicLink(), 'Consumer resolved a workspace link')
    assert(realpathSync(kit).startsWith(realpathSync(app) + '/'), 'Kit must be installed inside the consumer')
    // Reuse public contract assertions, with no app shims or TS path aliases.
    cpSync(join(root, 'src/test/public-api.type-test.ts'), join(app, 'public-api.type-test.ts'))
    const readme = readFileSync(join(root, 'packages/react-strudel-kit/README.md'), 'utf8')
    for (const [index, block] of [...readme.matchAll(/```(tsx|ts)\n([\s\S]*?)```/g)].entries()) {
      writeFileSync(join(app, `readme-${index}.${block[1]}`), block[2])
    }
    const tsc = join(app, 'node_modules/typescript/bin/tsc')
    run(process.execPath, [tsc, '-p', 'tsconfig.json'], app)
    run(process.execPath, [tsc, '-p', 'tsconfig.json', '--module', 'NodeNext', '--moduleResolution', 'NodeNext'], app)
    run(process.execPath, [join(app, 'node_modules/vite/bin/vite.js'), 'build'], app)
    const { preview } = await import(pathToFileURL(join(app, 'node_modules/vite/dist/node/index.js')).href)
    const server = await preview({ root: app, configFile: false, logLevel: 'warn', preview: { host: '127.0.0.1', port: 0 } })
    const page = await browser.newPage()
    page.setDefaultTimeout(15_000)
    page.setDefaultNavigationTimeout(30_000)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`) })
    try {
      // Observe native synthesis; this wrapper still invokes the real Web Audio method.
      await page.addInitScript(() => {
        window.__oscillators = 0
        window.__frequencies = []
        const start = OscillatorNode.prototype.start
        OscillatorNode.prototype.start = function (...args) {
          window.__oscillators++
          window.__frequencies.push(this.frequency.value)
          return start.apply(this, args)
        }
      })
      await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`)
      await expect(page.getByLabel('Playback')).toHaveText('idle')
      await expect(page.locator('pre')).toContainText('note("c4")')
      await page.getByRole('button', { name: 'Update', exact: true }).click()
      await expect(page.getByLabel('Update')).toHaveText('1')
      await expect(page.getByLabel('Playback')).toHaveText('idle')
      assert.equal(await page.evaluate(() => window.__oscillators), 0)
      await page.getByRole('button', { name: 'Play', exact: true }).click()
      await expect(page.getByLabel('Playback')).toHaveText('playing')
      await page.waitForFunction(() => window.__oscillators > 0)
      await page.getByRole('button', { name: 'Update', exact: true }).click()
      await expect(page.getByLabel('Update')).toHaveText('2')
      await expect(page.getByLabel('Playback')).toHaveText('playing')
      await page.waitForFunction(() => window.__frequencies.some(value => value > 390 && value < 394))
      await page.getByRole('button', { name: 'Stop', exact: true }).click()
      await expect(page.getByLabel('Playback')).toHaveText('idle')
      const assertStopped = async () => {
        // Let already-scheduled synth work settle, then require no new oscillators.
        await page.waitForTimeout(600)
        const count = await page.evaluate(() => window.__oscillators)
        await page.waitForTimeout(600)
        assert.equal(await page.evaluate(() => window.__oscillators), count)
      }
      await assertStopped()
      const count = await page.evaluate(() => window.__oscillators)
      await page.getByRole('button', { name: 'Play', exact: true }).click()
      await expect(page.getByLabel('Playback')).toHaveText('playing')
      await page.waitForFunction(count => window.__oscillators > count, count)
      await page.getByRole('button', { name: 'Unmount player', exact: true }).click()
      await expect(page.getByText('Unmounted', { exact: true })).toBeVisible()
      await assertStopped()
      await expect(page.getByRole('alert')).toHaveCount(0)
      assert.deepEqual(errors, [])
      console.log(`PASS React ${version.react}: isolated install, bundler/NodeNext declarations, README, production build, real Play/Update/Stop/unmount`)
    } finally {
      await page.close()
      await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))
    }
  }
  const artifacts = join(root, 'artifacts')
  mkdirSync(artifacts, { recursive: true })
  cpSync(tarball, join(artifacts, pack.filename))
  writeFileSync(join(artifacts, 'package-validation.json'), JSON.stringify({
    name: pack.name, version: pack.version, filename: pack.filename,
    integrity: pack.integrity, shasum: pack.shasum,
    sourceCommit: run('git', ['rev-parse', 'HEAD']).trim(),
    sourceDirty: Boolean(run('git', ['status', '--porcelain', '--untracked-files=no']).trim()),
    node: process.version, typescript: installedVersion('typescript'), vite: installedVersion('vite'),
    react: versions.map(version => version.react),
  }, null, 2) + '\n')
  console.log(`Tested artifact saved to ${join('artifacts', pack.filename)}`)
  success = true
} catch (error) {
  if (error.stdout) console.error(error.stdout.toString())
  if (error.stderr) console.error(error.stderr.toString())
  console.error(error.message)
  process.exitCode = 1
} finally {
  await browser?.close()
  if (success) rmSync(work, { recursive: true, force: true })
  else console.error(`Failed consumer kept for inspection: ${work}`)
}
