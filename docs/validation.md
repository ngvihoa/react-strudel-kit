# Validation

## Automated checks

Run `npm test -- --run`, `npm run lint`, `npm run typecheck` and `npm run test:e2e`.
The browser suite builds the production site and serves it on port 4173. Install
its browser with `npx playwright install chromium`; an existing binary can be
selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

The suite covers:

- All 25 routes at 375, 768 and 1440px, with no page-level horizontal overflow
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
The 2026-11-02 audit passed 19 Vitest files / 164 tests and 31 Playwright tests, with
lint, typecheck and production build passing. Learn/Cookbook screenshots were
also visually reviewed at 375, 768 and 1440px.

## Initial JavaScript load

Strudel is now dynamically imported on the first Play. Merely mounting the hook
does not import or initialize the runtime. The adapter resumes an AudioContext
synchronously in the gesture and hands that same context to Strudel before
initializing its scheduler, including when the runtime is still downloading.

Production build sizes with Vite 8.3.5 on 2026-11-02, before the Learn expansion:

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

## Listening pass — owner accepted 2026-11-04

After the Lo-fi iteration below, the owner accepted the current sound in the
conversation on 2026-11-04. No further sound changes were requested. This records
the owner's listening judgement, not a measured clipping check or a documented
cross-device/browser matrix. The listening checklist was:

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

The owner approved the revised Lo-fi chords on 2026-11-03, followed by acceptance
of the current sound overall on 2026-11-04.

## Path routing — 2026-11-03

Page URLs now use paths such as `/examples/lofi-loop`. The browser suite covers
direct visits and document reloads on every route, Back/Forward navigation and
audio cleanup. Old `/#/…` bookmarks are replaced with clean paths while retaining
query parameters. Internal ordinary clicks use browser history; modified clicks,
new tabs, downloads and same-page section anchors keep browser behavior.
Routing validation passed: 46 router/site tests, 34 browser tests, lint, typecheck
and production build. Reload tests request a fresh HTML document for each route.

Vite dev/preview provide the SPA fallback for reloads. Static hosting must serve
`index.html` for non-file paths; `public/_redirects` provides the rule for hosts
that support Netlify/Cloudflare-style redirects. See README for other hosts.

## Learn expansion — 2026-11-03

Make a beat is available at `/learn/make-a-beat`. It reuses the existing Backbeat
patterns and Cookbook sounds, adds an accent/tempo practice builder, and takes
all shown snippets from those running modules. Timing and velocity claims are
checked against the real pattern engine. Validation: 47 content/site tests,
7 browser checks (responsive, axe, playback, live controls and reload), lint,
typecheck and production build passed. Desktop/mobile screenshots were reviewed.

Add a bass line is available at `/learn/add-a-bass-line`: four-bar root notes,
the reusable root/fifth rhythm, drums and a bass-level/tempo practice player.
Validation: 49 content/site tests, focused browser checks for layout/axe at three
widths, every player and live controls, plus lint, typecheck and production build.

Layer the parts is available at `/learn/layer-the-parts`: the existing arpeggio,
melody and full arrangement with a melody-level/tempo practice builder. The
written arpeggio and melody timing have real-engine assertions. Validation:
52 content/site tests and 3 focused browser checks passed, with layout/axe at
375/768/1440px, playback, live controls, lint, typecheck and production build.

Control it with React is available at `/learn/control-it-with-react`. It renders
the real ReactMixer component and its source, covers state/build/play/update/stop,
and links the complete five-lesson Pager chain. There is no additional site Player
on this page. Browser checks include muting all parts, live changes and route cleanup.

Final 2026-11-03 validation passed: 20 Vitest files / 187 tests, all 45 Playwright
tests, lint, typecheck and production build. The 25 routes support direct visits
and document reloads, pass axe at 375/1440px and have no horizontal page overflow at
375/768/1440px. New lesson screenshots were visually reviewed. The owner approved
the Lo-fi chord revision at that point. Overall listening acceptance is recorded
in the 2026-11-04 section above.

## Release packaging — 2026-11-04

The owner selected the unscoped name `react-strudel-kit` and asked for a license
consistent with Strudel's requirements. The project and package now carry
AGPL-3.0-or-later, with the full license text and a package-specific README.
Both remained private during this initial packaging step; publication readiness
is tracked separately below.

A real `npm pack` ran its prepack build, removed a deliberately stale output file
and produced 46 files (36,407 bytes compressed / 159,300 bytes unpacked at this
stage). Both ESM entrypoints and their declarations were present, with production
source and declaration maps. Test files, mocks and build/config scripts were
absent. Lint and `git diff --check` passed. Tarball consumer testing follows as a
separate release step; these packaging checks alone do not establish playback.

Registry checks on this date returned 404 for the name and E401 for `npm whoami`.
The name is not reserved, and publication still needs an authenticated npm account.

### Independent tarball consumers

Run `npm run test:package` after installing Chromium (or setting the same
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` used by the browser suite). This packs the
workspace with prepack enabled, inspects that exact tarball and installs it into
two temporary apps outside the workspace. No package symlink, source alias,
workspace node_modules or app ambient shim is used to resolve kit code/types.
The harness itself uses the repository's Playwright installation.

Passed on Node 26.13.0, TypeScript 6.0.3 and Vite 8.3.5:

| React / React DOM | React / React DOM types | Declarations | Browser |
| --- | --- | --- | --- |
| 18.3.1 | 18.3.31 / 18.3.7 | `bundler` and `NodeNext`, strict, `skipLibCheck: false` | Production build, real Chromium/Web Audio |
| 19.3.0 | 19.3.0 / 19.3.0 | Same | Same |

Each app compiles the public API's valid/invalid type assertions and the package
README's TypeScript/TSX snippets. Browser checks cover Strict Mode, no autoplay on
mount or stopped update, Play, live update to a different pitch, Stop, fresh Play
and unmount of the final consumer. Native oscillator calls are observed without
replacing synthesis; the updated pitch appears and new oscillator scheduling
ceases after Stop/unmount. Runtime/console/HTTP errors fail the check.

This caught declarations with extensionless relative imports that failed under
NodeNext. Production source imports now use `.js` specifiers, making the emitted
declarations valid in both resolution modes. The checks establish these exact
React/toolchain combinations in Chromium, not all React/TypeScript versions,
SSR playback or cross-device compatibility. Failed temporary apps are retained
with their paths printed for diagnosis; successful temporary apps are removed.

### Release candidate preflight

The final candidate includes CHANGELOG, LICENSE and the install-focused package
README: 47 files, 36,813 bytes compressed / 160,665 bytes unpacked. Both isolated
React consumers passed again against this artifact. Successful runs now retain
the tested `.tgz` and `package-validation.json` under ignored `artifacts/`, with
integrity, source commit, tracked dirty state and tested versions.

Local release checks passed: all 20 Vitest files / 187 tests, 45 Playwright site
tests, lint, typecheck and the production build. `npm audit --omit=dev` returned
zero findings on 2026-11-04. The existing warning for the deferred Strudel chunk
over 500 kB remains.

The GitHub Actions workflow runs those checks and the isolated consumers on
Node 24, then uploads the tested tarball and browser diagnostics. It passed
actionlint 1.7.12 locally. At this preflight stage the hosted workflow had not run
yet; the later hosted results are recorded below.

Only the library package is now publishable, with public access and the public
npm registry configured; the root remains private. A publish dry-run on the
tested tarball passed with `--tag latest --access public --ignore-scripts`.
At this preflight stage no package had been published or tagged. Actual
publication and registry checks are recorded below.

### npm presentation and deployed documentation

The owner supplied `https://react-strudel-kit.vercel.app/` as the public website.
Package `homepage` now uses that URL; repository and issue links remain on GitHub.
The package README includes an absolute logo image URL, Website/Learn/API/GitHub/
Issues links and links to the live Cookbook, examples and Playground. The same
logo is included as `assets/rsk-logo.png` in the tarball. The package LICENSE link
is absolute so it can work from npm's rendered README as well as GitHub.

The updated 48-file tarball (67,936 bytes compressed at this stage) passed both
isolated React consumers again, including README compilation and installed
integrity checks. `npm run test:package -- --registry` adds post-publication
verification against the registry's integrity and installs that exact npm version.

Live checks initially found HTTP 200 at the website root and HTTP 404 at
`/learn/first-song`. `vercel.json` now supplies the SPA rewrite recommended in
[Vercel's Vite documentation](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).
After deployment, all 13 absolute README URLs returned HTTP 200, including the
logo. A real Chromium browser verified direct visits and document reloads for
the live Learn/API/Cookbook/Examples/Playground links without runtime/HTTP errors.

The first hosted CI run on release candidate `4329165` passed on Node 24:
[run 41834296827](https://github.com/ngvihoa/react-strudel-kit/actions/runs/41834296827).
The final metadata/assets commit `7210778` also passed hosted CI on Node 24:
[run 41835342237](https://github.com/ngvihoa/react-strudel-kit/actions/runs/41835342237).

## npm publication — 2026-11-04

`react-strudel-kit@0.1.0` was published by `ngvihoa` with public access and the
`latest` dist-tag, from the 48-file tarball built at commit
`7210778645dfebdf8c8783d9eb00f44897bb2ecc`. The owner completed npm's browser
authentication. npm initially showed its `0.0.0-stage` placeholder while
processing the upload; the real version subsequently became available.

Registry verification confirmed `0.1.0`, `latest: 0.1.0`, the Vercel homepage,
GitHub repository/issues metadata and README containing the logo/website links.
The registry's tarball integrity matches the tested artifact:

```text
sha512-Uib1kPhknBZ8CwcYbQnwDPYcjZJMzEeH5I8aHB+pcPr1P+2MsE99W6Bu4AmJ/pePYs3WhPPUQ29DnI1S1cAz7Q==
```

`npm run test:package -- --registry` passed for React/React DOM 18.3.1 and 19.3.0.
Each consumer installed the version from npm, checked lockfile integrity against
the local artifact, compiled strict declarations in bundler and NodeNext modes,
compiled README examples and built a production Vite app. Real Chromium/Web Audio
checks passed Play/Update/Stop/unmount with no stopped autoplay or runtime errors.

The npm website returned HTTP 403 to this environment's web/curl clients, so its
rendered UI was not visually inspected. Registry metadata and README contents
were verified directly, and the README's image/link targets were checked live.
The immutable published package files were not changed after release; Git tag
`v0.1.0` points at the source commit, with this record committed separately.

## npm README patch — 2026-11-04

Version `0.1.1` removes maintainer-only local tarball instructions from the npm
README, moves them to the release guide and keeps the consumer requirements in a
short Compatibility section. Detailed local test-environment notes remain in
this validation document. The npm `description` field is unchanged; the reported
text was part of the rendered package README.

Source commit: `3f6cf8dcfd327511facb126848a1446c56ca6894`, Git tag `v0.1.1`.
[Hosted CI passed](https://github.com/ngvihoa/react-strudel-kit/actions/runs/41838565274).
Both local tarball consumers and registry-installed consumers passed on React
18.3.1 and 19.3.0, including strict declarations, README examples, production
build and real browser playback/cleanup. Compared with 0.1.0, every runtime,
source, declaration, license and logo file is byte-identical; only README,
CHANGELOG and the package version differ.

Registry checks confirmed `latest: 0.1.1`, the cleaned README and this integrity
for the 48-file, 67,879-byte tarball:

```text
sha512-2CGdm9rhFkie59Ka23ELwuon1RKfGDZbPwnWb+6qwLH+x8FyQaKJibZhSQivSqR9AJ6VgH7gH8GiY1MhkRL5hQ==
```
