# React Strudel Kit

[![React Strudel Kit](https://raw.githubusercontent.com/ngvihoa/react-strudel-kit/main/packages/react-strudel-kit/assets/rsk-logo.png)](https://react-strudel-kit.vercel.app/)

Typed Strudel pattern composition and a shared React playback hook. Strudel owns
the pattern engine and audio scheduler; this kit adds typed builders, serializers
and React lifecycle integration.

[Website](https://react-strudel-kit.vercel.app/) ·
[Learn](https://react-strudel-kit.vercel.app/learn/first-song) ·
[API reference](https://react-strudel-kit.vercel.app/api) ·
[GitHub](https://github.com/ngvihoa/react-strudel-kit) ·
[Report an issue](https://github.com/ngvihoa/react-strudel-kit/issues)

## Installation

Install into an existing React application:

```sh
npm install react-strudel-kit
```

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

## Documentation

- [Usage, API boundaries and troubleshooting](https://github.com/ngvihoa/react-strudel-kit/blob/main/docs/usage.md)
- [Sound Cookbook](https://react-strudel-kit.vercel.app/cookbook/kick)
- [Runnable examples](https://react-strudel-kit.vercel.app/examples/simple-melody)
- [Interactive Playground](https://react-strudel-kit.vercel.app/playground)
- [Validation and tested versions](https://github.com/ngvihoa/react-strudel-kit/blob/main/docs/validation.md)

## Compatibility

Requires React 18+ and an ESM-capable bundler. TypeScript declarations are included.
Playback needs a browser with Web Audio; use the hook in a browser/client component.
See the [usage guide](https://github.com/ngvihoa/react-strudel-kit/blob/main/docs/usage.md#compatibility)
for detailed compatibility information.

## License

AGPL-3.0-or-later. See [LICENSE](https://github.com/ngvihoa/react-strudel-kit/blob/main/LICENSE) and the
[Strudel integration guidance](https://strudel.cc/technical-manual/project-start/).
Strudel dependencies retain their own notices and licenses.
