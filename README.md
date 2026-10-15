# React Strudel Kit

This repository contains a typed Strudel domain model, the `react-strudel-kit`
package, and a Vite playground.

The package implementation lives in `packages/react-strudel-kit/src`; the
playground consumes its built entrypoints. Editor state and localStorage remain
in the playground.

## React playback API

Import React integration separately from pattern helpers:

```tsx
import { fn, mini } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

function Player() {
  const { play, stop, status, error } = useStrudel()

  return (
    <>
      <button onClick={() => play(fn('sample', mini('bd')))}>Play</button>
      <button onClick={stop}>Stop</button>
      <output>{status}</output>
      {error && <p role="alert">{error.message}</p>}
    </>
  )
}
```

`play(input)` accepts Strudel code, a typed `PatternExpression`, or a native
native Strudel pattern with a `play()` method. The hook owns transport state;
consumers own their editor content and persistence.

All mounted hooks share one engine and observe the same `status` and `error`.
The engine initializes once, including under React Strict Mode. Play waits for
initialization and resumes browser audio from the calling event handler; invoke
it from a click or keyboard gesture. Initialization failures can be retried with
Play. Errors carry an `initialization`, `evaluation`, or `transport` code.

Playback requests are serialized, and only the latest request starts playback.
Stop cancels pending requests and clears the current error. Unmounting one
consumer leaves others playing; unmounting the last consumer stops playback
and invalidates pending work. A scheduler start already in progress is stopped
again when it settles after cancellation. The engine and Strudel-owned audio
context are retained for remounts; this hook does not close that shared context.

The adapter targets `@strudel/web` **1.3.0** (pinned). It prepares patterns without
autoplay, checks evaluation errors in the returned engine state, and awaits
explicit scheduler start. Native patterns use `setPattern` rather than their
fire-and-forget `.play()` method. Automated lifecycle tests mock the Strudel
and Web Audio boundaries. A Chrome smoke check also covers synth playback
state, Stop, syntax errors, recovery, rapid Play/Stop, and persistence on reload.
Audible output and browser/device compatibility still need manual validation.

## Typed function API

Use one registry function instead of importing one helper per Strudel function:

```ts
import { fn, mini, toStrudelCode } from 'react-strudel-kit'

const code = toStrudelCode(fn(
  'stack',
  fn('sample', mini('bd')),
  fn('note', mini('c3 eb3')),
))

// stack(s("bd"), note("c3 eb3"))
```

Domain names such as `sample`, `layer`, and `lowPass` are mapped to Strudel
runtime names by the shared registry. Invalid function names and argument
shapes are rejected by TypeScript.

## Nested Mini-Notation

AST nodes preserve their nesting when serialized:

```ts
import { fast, sample, sequence, toMiniNotation } from 'react-strudel-kit'

toMiniNotation(fast(sequence(sample('bd'), sample('sd')), 2))
// '[bd sd]*2': both notes play twice per cycle.

toMiniNotation(sequence(sample('bd'), sequence(sample('sd'), sample('hh'))))
// 'bd [sd hh]': sd and hh share the second step.
```

Nested parallel patterns, choices, and modifier operands are grouped as well.
Sequence lanes inside a stack, choice, or polymeter keep their full step counts.
`raw(...)` is an opaque escape hatch: root fragments remain verbatim, while
nested fragments are enclosed in brackets. Use typed `sequence(...)` nodes
when individual steps must be exposed to a polymeter lane.

## Development

```bash
npm install
npm run dev
npm run build
npm test -- --run
npm run lint
```

`dev`, `build`, and `test` build the workspace package first. After editing
package source during a dev or test watch session, run `npm run build:package`
again. `build` also checks app, package, and type-test files. Unit tests live
beside the package implementation; playground integration tests import the
built package through its public exports and mock the audio engine.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
