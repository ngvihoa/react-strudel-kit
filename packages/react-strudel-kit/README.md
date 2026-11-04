# React Strudel Kit

Typed Strudel pattern composition and a shared React playback hook. Strudel owns
the pattern engine and audio scheduler; this kit adds typed builders, serializers
and React lifecycle integration.

## Release status and installation

The first npm release is being prepared. This package is still private; there is
no published version to install yet. A local tarball can be installed into a
separate React application:

```sh
# From the repository root; prepack builds ESM and declarations first.
npm pack --workspace=react-strudel-kit --pack-destination /tmp

# From your React application's directory.
npm install /tmp/react-strudel-kit-0.1.0.tgz
```

Requires React 18 or later, an ESM-capable bundler and a browser with Web Audio.
Use TypeScript's `moduleResolution: "bundler"` for a Vite application. The hook
must run in a browser/client component. There is no CommonJS build.

## Play a typed pattern

```tsx
import { chain, fn, pitch, sample, sequence } from 'react-strudel-kit'
import { useStrudel } from 'react-strudel-kit/react'

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

## Playback contract

- Call `play(input)` in a click or keyboard gesture to unlock browser audio.
  Inputs can be raw Strudel code, a typed `PatternExpression` or a native pattern.
- `update(input)` replaces a running pattern without restarting the scheduler;
  it does nothing while stopped.
- `stop()` also cancels pending playback. Unmounting the final hook consumer stops
  playback. All hook consumers share one transport and observe the same status/error.
- The runtime loads on first Play. Mounting or changing state while stopped never
  starts audio. The shared engine/context remain available after unmount.
- Built-in synths work without sample downloads; this kit does not load sample banks.

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

`fn` validates names and argument types for the supported registry subset.
`mini()` validates syntax with Strudel's parser. Types do not check sample
availability, musical values or raw JavaScript code.

## Documentation and compatibility

- [Usage, API boundaries and troubleshooting](https://github.com/ngvihoa/react-strudel-kit/blob/main/docs/usage.md)
- [Reference app, lessons, Cookbook and examples](https://github.com/ngvihoa/react-strudel-kit#readme)
- [Validation and tested versions](https://github.com/ngvihoa/react-strudel-kit/blob/main/docs/validation.md)
- Runtime dependencies are pinned to `@strudel/web@1.3.0` and `@strudel/mini@1.2.6`.
- ESM, declarations, declaration maps and production TypeScript source are included.

## License

AGPL-3.0-or-later. See [LICENSE](./LICENSE) and the
[Strudel integration guidance](https://strudel.cc/technical-manual/project-start/).
Strudel dependencies retain their own notices and licenses.
