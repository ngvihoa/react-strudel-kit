# Validation — 2026-11-02

## Automated checks

Run `npm test -- --run`, `npm run lint`, `npm run typecheck` and `npm run test:e2e`.
The browser suite builds the production site and serves it on port 4173. Install
its browser with `npx playwright install chromium`; an existing binary can be
selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

The suite covers:

- All 21 routes at 375, 768 and 1440px, with no page-level horizontal overflow
  or links to unknown routes. Desktop and mobile Learn/Cookbook screenshots are
  saved under the ignored `test-results/` directory for visual review.
- Automated axe accessibility checks on every route, plus the playing state of
  the Kick player. Skip navigation moves keyboard focus without changing the hash.
- Play/Stop for every site player against real Strudel and Web Audio, player
  ownership, keyboard sliders, live changes, and no autoplay while stopped.
- The real React mixer and Playground, including the code editor, Play/Stop
  shortcuts and stopping playback on route changes.
- Cancellation while audio resume is pending, followed by a working fresh Play.
  These tests delay the native resume promise; they do not replace the engine.
  Unit integration tests separately assert that cancelled requests never evaluate.

Checks ran on Node 26.13.0 and Chromium. Automated tests verify application state,
pattern evaluation and lifecycle behavior; they cannot establish audible quality.

## Dependency audit

`npm audit fix` updated packages within the existing semver ranges, including
Vite 8.3.5, Vitest 5.0.5, source-map-js 1.2.2, undici 8.12.3 and zod 4.6.7.
The audit decreased from 18 findings (14 moderate, 4 high) to 12 moderate findings,
all tracing to the same minimatch advisory in ESLint/typescript-eslint tooling.
Production dependencies have zero reported findings with `npm audit --omit=dev`.

The remaining [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249)
requires 11.0.1 or later, while the current upstream ESLint/config-array and
typescript-estree releases require minimatch 10. The npm force suggestion would
downgrade typescript-eslint to 8.14.0. No forced downgrade, major override or audit
suppression was applied. Recheck upstream support before updating this dependency.

## Listening pass — pending owner review

- Listen to each Cookbook sound alone and in its groove; compare default,
  minimum, maximum and reset settings with the explanation on the page.
- Prioritize bass, keys, lead, pad, Lo-fi and House. Check balance, harshness,
  clipping, filter extremes and whether the slider range remains useful.
- Listen through live tempo/parameter changes, mute/solo, Stop and route changes.
- Repeat on the owner's actual desktop/mobile browsers and output devices.

No gain, sound default or slider range has been tuned from listening evidence.
