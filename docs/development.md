# Repository development

Maintainer instructions for the reference website and workspace package. For
package installation and integration, start with the [README](../README.md).

## Local setup and playground


Use Node.js 24.15 or later in the Node 24 series for development. The latest local
checks ran on Node 26.13.0; see [validation notes](docs/validation.md) for coverage.

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite. Start with your device volume low; nothing
plays until you press Play. The header links Home, Docs and Playground. Docs has a shared sidebar for
lessons, sound recipes, examples and the API reference. Existing article URLs
remain stable; `/docs` is the common starting point.

Code shown on these pages is cut from the module that plays (`src/content/`,
`src/songs/`), so the text and the sound cannot drift apart. Timing claims made
in the text are checked against Strudel's real pattern engine in tests. Leaving a page stops
its music, and only one player plays at a time.

Routes use normal paths, for example `/examples/lofi-loop`. Direct visits and
reloads work in Vite dev/preview. Old `/#/…` bookmarks are replaced with the clean
URL. Production builds prerender every public route into its own HTML document.
Vercel serves clean URLs and returns `404.html` with status 404 for missing pages;
other hosts must provide equivalent document routing rather than a catch-all 200
SPA fallback. See [website SEO](seo.md) for output files, metadata, social images
and deployment verification.

In the **Playground**, the **Mixer** opens with **Dance Monkey**, an eight-bar
instrumental chorus:

- Change **tempo** and **master volume** while the music runs.
- **Mute** individual parts, or **Solo** one or several parts together.
- Adjust each part's level. Change the melody, bass or keys between triangle,
  sine, square and sawtooth synths.
- **Reset mix** restores the current arrangement's settings, including its tempo,
  while keeping playback running. Controls changed while stopped never autoplay.
- Choose a simpler arrangement from the dropdown to experiment with one or two parts.
  Changing arrangements stops playback and starts with a fresh mix.
- **Ctrl/⌘+Enter** plays; **Escape** or **Stop** stops, including pending work.
- **Code editor** keeps an independent, editable Strudel draft. Switching modes
  stops playback and retains mixer settings and the editor draft. Only the draft
  is saved locally; mixer settings reset on reload. **Session only** means draft
  storage failed. Copy that draft before leaving. Reload never starts playback.

All arrangements use built-in synths without sample downloads. See
[Dance Monkey notes and controls](docs/dance-monkey.md).

## Commands and validation


| Command | Purpose |
| --- | --- |
| `npm run dev` | Build the workspace package, then run Vite with HMR |
| `npm run build` | Build package, check types, and build the playground |
| `npm run build:package` | Emit package ESM and declarations |
| `npm run typecheck` | Check app, package, tests, and standalone consumer declarations |
| `npm test -- --run` | Build the package, then run the full Vitest suite |
| `npm run test:e2e` | Build and test the production site in Chromium (Playwright + axe) |
| `npm run test:package` | Pack, install and test isolated React 18/19 consumers, including types and real browser playback |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve a previously built playground |

After editing package source during a dev/test watch session, run
`npm run build:package` again. App source changes use Vite HMR directly.

```text
packages/react-strudel-kit/src/  Typed API, serializers, transport, unit tests
src/                            Reference app: playground, mixer and integration tests
src/site/                       Learning-site shell, page templates and shared components
src/content/                    Lesson and Cookbook patterns shown and played on those pages
src/test/public-api.type-test.ts  Compile-time checks against the built package
docs/                           Usage guide and historical design notes
```

The package's `tsconfig.json` includes source and tests so the editor loads local
declarations. `tsconfig.build.json` emits production declarations and excludes
tests. Consumer type-tests use `skipLibCheck: false` without the app's ambient shims.

Tests cover parser/serializer behavior, real Strudel pattern timing without
audio, shared transport lifecycle, React Strict Mode, error/cancellation paths,
and the playground through built package exports. Unit playback tests mock Web Audio.
Browser tests use real Strudel and Web Audio for every page player, keyboard controls,
ownership, cancellation and route cleanup, and check accessibility and all routes at
375, 768 and 1440px. They do not judge sound quality or device compatibility.

Before the first browser test run, install Chromium with `npx playwright install chromium`.
To use an existing Chromium binary, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
The test server builds and serves the production app on port 4173.

## Publishing

Follow the [release guide](release-plan.md). Internal development instructions
belong in this repository and must not appear in the npm README or tarball.
