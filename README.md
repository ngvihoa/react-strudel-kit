# React Strudel Kit

**Write music in TypeScript. Play it with React.**

Build [Strudel](https://strudel.cc) patterns with typed functions and Mini-Notation
helpers, then connect them to your own React controls. Strudel provides the music
engine and audio; React Strudel Kit provides typed composition and playback integration.

[Explore the website](https://react-strudel-kit.vercel.app/) ·
[Documentation](https://react-strudel-kit.vercel.app/docs) ·
[npm](https://www.npmjs.com/package/react-strudel-kit)

## Install

```bash
npm install react-strudel-kit
```

Requires React 18 or later, an ESM-capable bundler and a browser with Web Audio.
Use the playback hook in a browser/client component. TypeScript declarations
support `bundler` and `NodeNext` resolution. There is no CommonJS build.

## Play your first pattern

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
## Compose with type checking


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

## Find your next sound

Start with [Your first song](https://react-strudel-kit.vercel.app/learn/first-song),
then follow the lessons through drums, bass, arrangement and React controls.
The [Docs](https://react-strudel-kit.vercel.app/docs) bring the lessons, sound
recipes, examples and API reference together.

- Shape synthesized sounds with the [Sound Cookbook](https://react-strudel-kit.vercel.app/cookbook/kick).
- Explore a [lo-fi loop](https://react-strudel-kit.vercel.app/examples/lofi-loop), a
  [house loop](https://react-strudel-kit.vercel.app/examples/house-loop) or a
  [React mixer](https://react-strudel-kit.vercel.app/examples/react-mixer).
- Look up [API functions](https://react-strudel-kit.vercel.app/api) and jump to examples that use them.
- Try the [Playground](https://react-strudel-kit.vercel.app/playground) to mix parts or edit code.

For integration details, see the [usage guide](docs/usage.md), including playback
lifecycle, errors and compatibility.

## License

[AGPL-3.0-or-later](LICENSE). Strudel retains its own copyright and license notices.
