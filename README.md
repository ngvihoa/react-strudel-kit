# React Strudel Kit

A TypeScript toolkit for creating Strudel patterns, with a browser-only React
playback hook and a small Vite playground. Strudel owns the pattern engine and
audio scheduler; this package provides typed composition and React integration.

The package is currently a **private workspace package**, not an npm release.

## Run the playground

Use Node.js 24.15 or later in the Node 24 series; local checks use 24.22.0.

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite. Press **Play pattern** to start the
built-in melody. Begin with your output volume low.

- Edit the code, then press **Ctrl+Enter** or **⌘+Enter** to apply it.
- **Escape** or **Stop** stops playback, including pending requests.
- **Reset** stops playback and restores the default melody.
- Load **Melody**, **Bass**, or **Layers** to replace the editor content without
  automatically playing it. All three use built-in synths, with no sample downloads.
- Edits, loaded examples, and resets are saved on this device when localStorage
  works. **Session only** means persistence failed; copy your code before leaving.
  An untouched default is labeled **New draft**. Reload never starts playback.

## React playback

Use the workspace package after it has been built. React integration is a
separate entrypoint and must run in a browser/client component.

```tsx
import { chain, fn, mini } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

const melody = chain(
  fn('note', mini('c4 e4 g4 b4')),
  fn('gain', 0.25),
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
All mounted hooks share one transport. Unmounting the last consumer stops
playback; the Strudel-owned engine/context remain available for remounts.

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
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve a previously built playground |

After editing package source during a dev/test watch session, run
`npm run build:package` again. App source changes use Vite HMR directly.

```text
packages/react-strudel-kit/src/  Typed API, serializers, transport, unit tests
src/                            Reference playground and integration tests
src/test/public-api.type-test.ts  Compile-time checks against the built package
docs/                           Usage guide and historical design notes
```

The package's `tsconfig.json` includes source and tests so the editor loads local
declarations. `tsconfig.build.json` emits production declarations and excludes
tests. Consumer type-tests use `skipLibCheck: false` without the app's ambient shims.

Tests cover parser/serializer behavior, real Strudel pattern timing without
audio, shared transport lifecycle, React Strict Mode, error/cancellation paths,
and the playground through built package exports. Web Audio lifecycle is mocked
in automated playback tests; audible output and device compatibility need manual checks.

## License and release status

Both the root project and package remain private. This repository has no project
license selected yet. The pinned Strudel packages declare `AGPL-3.0-or-later`;
read the [upstream integration and license guidance](https://strudel.cc/technical-manual/project-start/)
before distributing an application or publishing a package. Choosing a compatible
project license and completing release packaging remain separate release work.
