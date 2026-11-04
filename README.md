# React Strudel Kit

A TypeScript toolkit for creating Strudel patterns, with a browser-only React
playback hook and a small Vite playground. Strudel owns the pattern engine and
audio scheduler; this package provides typed composition and React integration.

The package is currently a **private workspace package**, preparing its first npm
release. See the [release plan](docs/release-plan.md) and
[package README](packages/react-strudel-kit/README.md) for local tarball installation.

## Run the playground

Use Node.js 24.15 or later in the Node 24 series for development. The latest local
checks ran on Node 26.13.0; see [validation notes](docs/validation.md) for coverage.

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite. Start with your device volume low; nothing
plays until you press Play. The header links five sections:

| Section | Route | What it is |
| --- | --- | --- |
| Learn | `/learn/…` (5 lessons) | Notes → drums → bass → arrangement → React playback, with players and practice controls |
| Sound Cookbook | `/cookbook/kick`, `/snare`, `/hi-hat`, `/bass`, `/keys`, `/lead`, `/pad` | How each synthesized sound is built, with live sliders |
| Examples | `/examples/…` (11 pages) | Rhythm, harmony, arrangement, React control and styles, one goal per page |
| API | `/api` | Every public helper and `fn` function, generated from the package, with links to pages that use it |
| Playground | `/playground` (default) | The free-form mixer and code editor described below |

Code shown on these pages is cut from the module that plays (`src/content/`,
`src/songs/`), so the text and the sound cannot drift apart. Timing claims made
in the text are checked against Strudel's real pattern engine in tests. Leaving a page stops
its music, and only one player plays at a time.

Routes use normal paths, for example `/examples/lofi-loop`. Direct visits and
reloads work in Vite dev/preview. Old `/#/…` bookmarks are replaced with the clean
URL. For static deployment, serve `index.html` for unknown non-asset paths;
`public/_redirects` supplies this rule for Netlify/Cloudflare Pages. Other hosts
need the equivalent SPA fallback (for nginx: `try_files $uri $uri/ /index.html;`).

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

## React playback

Use the workspace package after it has been built. React integration is a
separate entrypoint and must run in a browser/client component.

```tsx
import { chain, fn, pitch, sample, sequence } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

// Four notes, one bar, at 30 cycles per minute — the same pieces as Lesson 1.
const melody = chain(
  fn('note', sequence(pitch('c4'), pitch('e4'), pitch('g4'), pitch('b4'))),
  fn('instrument', sample('triangle')),
  fn('gain', 0.3),
  fn('cpm', 30),
)

export function Player() {
  const { play, stop, status, error } = useStrudel()

  return (
    <>
      <button onClick={() => void play(melody)}>Play</button>
      <button onClick={stop}>Stop</button>
      <output>{status}</output>
      {error && <p role="alert">{error.message}</p>}
    </>
  )
}
```

`play(input)` accepts code, a typed `PatternExpression`, or a native Strudel
pattern. Call it from a click or keyboard gesture so the browser can enable audio.
`update(input)` replaces a running pattern without stopping or restarting the
scheduler. It does nothing while stopped; use it for live React controls after Play.
All mounted hooks share one transport. The Strudel runtime loads on the first Play;
audio resumes in that gesture even if its chunk is still downloading.
Unmounting the last consumer stops playback; the shared engine/context remain
available for remounts.
The mixer builds typed patterns from React state and passes them to `play` or
`update`. Serialization is an internal engine-adapter step.

See [the usage guide](docs/usage.md) for lifecycle, error handling, supported
functions, Mini-Notation, compatibility, and troubleshooting.

## Typed composition

```ts
import { chain, fn, mini, patternCallback, toStrudelCode } from 'react-strudel-kit'

const melody = chain(
  fn('note', mini('c4 e4 g4 b4')),
  fn('lowPass', 900),
  fn('every', 4, patternCallback(fn('rev'))),
)

toStrudelCode(melody)
// note("c4 e4 g4 b4").lpf(900).every(4, x => x.rev())
```

`fn` checks function names, argument tuples, and exact return types against the
shared registry. `mini()` validates Mini-Notation syntax with Strudel's parser.
This covers the declared API subset; it does not verify sample availability,
musical values, or raw JavaScript code.

## Development

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

## License and release status

This project is licensed under [AGPL-3.0-or-later](LICENSE), selected for the first
release to follow Strudel's integration guidance. The pinned Strudel packages
also declare `AGPL-3.0-or-later` and retain their own notices. See the
[upstream integration and license guidance](https://strudel.cc/technical-manual/project-start/).
The root app and package remain private while release checks are completed;
[the release plan](docs/release-plan.md) tracks packaging and publication.
