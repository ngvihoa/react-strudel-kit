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
- Automated axe accessibility checks on every route at 375 and 1440px, plus the
  playing state of the Kick player. Skip navigation moves keyboard focus without
  changing the hash; mobile navigation disclosures work by keyboard.
- Play/Stop for every site player against real Strudel and Web Audio, player
  ownership, keyboard sliders, live changes, and no autoplay while stopped.
- The real React mixer and Playground, including the code editor, Play/Stop
  shortcuts and stopping playback on route changes.
- Cancellation while audio resume is pending, followed by a working fresh Play.
  These tests delay the native resume promise; they do not replace the engine.
  Unit integration tests separately assert that cancelled requests never evaluate.
- A deliberately delayed runtime download: no Strudel runtime before Play,
  synchronous audio resume in the first gesture, successful playback after the
  download finishes, and no second runtime download on a later Play.

Checks ran on Node 26.13.0 and Chromium. Automated tests verify application state,
pattern evaluation and lifecycle behavior; they cannot establish audible quality.
Final results: 19 Vitest files / 164 tests and 31 Playwright tests passed, with
lint, typecheck and production build passing. Learn/Cookbook screenshots were
also visually reviewed at 375, 768 and 1440px.

## Initial JavaScript load

Strudel is now dynamically imported on the first Play. Merely mounting the hook
does not import or initialize the runtime. The adapter resumes an AudioContext
synchronously in the gesture and hands that same context to Strudel before
initializing its scheduler, including when the runtime is still downloading.

Production build sizes with Vite 8.3.5:

| JavaScript | Before | After |
| --- | --- | --- |
| Initial entry | 1,043.64 kB (330.59 kB gzip) | 408.93 kB (122.32 kB gzip) |
| Runtime loaded on first Play | Included in entry | 650.28 kB (215.28 kB gzip) |

Initial JS decreases by about 61% (63% for gzip). This defers the runtime;
it does not reduce total JS downloaded after Play. Vite's 500 kB warning remains
for the deferred Strudel chunk. The warning threshold was not raised.

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

### Lo-fi chord iteration — 2026-11-03

The owner reported that the Jazzy chords sounded sharp and insufficiently mellow.
The Lo-fi example now overrides the Cookbook keys with triangle rather than square,
a 900 Hz low-pass, 35 ms attack, 1.8 s decay and 450 ms release. The four-note
Dm7–G7–Cmaj7–Am7 progression is retained, with wider voicings, shared notes and
smaller voice movements. The isolated player and full loop use this same pattern.
Cookbook defaults and other examples are unchanged.

Validation for this iteration: 45 content/site tests, lint, typecheck and production
build passed. The focused Lo-fi Playwright test passed Play/Stop for all four
players against the real engine, including Jazzy chords and the full loop.

This is a candidate adjustment based on the owner's listening feedback; the revised
sound still needs owner review. Other sounds, gains and slider ranges remain pending.
