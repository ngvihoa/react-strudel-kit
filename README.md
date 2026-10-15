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
pattern with a `play()` method. The hook owns transport state; consumers own
their editor content and persistence. Lifecycle hardening (shared engine,
initialization errors, concurrent playback, and Strict Mode) is still pending.

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
