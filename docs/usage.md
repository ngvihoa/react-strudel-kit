# Usage guide

This guide describes the implemented API. [Design notes](README.md#historical-design-notes)
record earlier proposals and do not define the current contract.

## Entrypoints

| Import | Contents |
| --- | --- |
| `react-strudel-kit` | `fn`, registry, composition helpers, Mini-Notation AST/validation, serializers, public types |
| `react-strudel-kit/react` | `useStrudel` and transport/input/error types; browser-only |

The core entrypoint can build/serialize patterns without initializing audio.
The React entrypoint uses the Strudel browser bundle and is not an SSR entrypoint.
No provider is required: hooks share a module-level transport.

## Playback contract

```ts
import type { StrudelInput, UseStrudelResult } from 'react-strudel-kit'
```

`UseStrudelResult` exposes:

| Member | Contract |
| --- | --- |
| `play(input: StrudelInput): Promise<void>` | Queue the latest pattern and wait for its operation to settle |
| `stop(): void` | Stop playback, invalidate pending Play requests, and clear the current error |
| `status` | `idle`, `playing`, or `error` |
| `error` | `StrudelError` or `null` |

Input can be a raw Strudel code string, a `PatternExpression` built with this
package, or a native Strudel pattern. A native pattern is prepared through the
engine's `setPattern` API; its fire-and-forget `.play()` method is not invoked.

Initialization is shared, including under React Strict Mode. A failed
initialization can be retried with Play. Browser audio is resumed from the Play
handler before awaiting initialization. Invoke Play from a user gesture.

Requests are serialized. A newer request supersedes older pending requests;
only the current request may start playback. Stop also cancels a pending audio
resume, allowing a fresh gesture to try again. Evaluation already in progress
must settle before another evaluation can use the same engine. A scheduler start
that settles after cancellation is stopped again.

All mounted consumers observe the same status/error. Removing one consumer
leaves the others playing; removing the last consumer stops playback and
invalidates pending work. The shared engine and Strudel-owned AudioContext are
retained for remounts, not closed by the hook.

`idle` also covers preparation before playback. The reference app tracks its
own “Starting…” feedback and leaves Stop available during that operation.

## Errors

Playback failures are returned in `error`, rather than thrown as the normal
`play()` error contract. Awaiting Play also resolves for a superseded request;
inspect `status` and `error` to render the current transport state.

| Error code | Meaning |
| --- | --- |
| `initialization` | Strudel could not initialize |
| `evaluation` | Typed serialization or code evaluation failed |
| `transport` | Audio resume, native pattern preparation, start, or stop failed |
| `unknown` | Reserved fallback in the public error type |

Errors include `message` and an optional original `cause`. Strudel can record an
evaluation error in engine state without rejecting its Promise; the adapter
checks that state before starting playback. Audio output errors only logged
internally by Strudel are not guaranteed to reach the hook.

## Factories and modifiers

`fn(name, ...args)` derives overloads from the runtime call contracts. Narrow a
dynamic name before calling it. Plain Mini-Notation strings must pass through
`mini()` or be represented by typed AST nodes.

| Factory | Runtime name / arguments |
| --- | --- |
| `sample` | `s(miniPattern)` |
| `sound`, `note` | Same runtime names; one Mini-Notation pattern |
| `n` | One number or Mini-Notation pattern |
| `stack`, `layer` | `stack(firstPattern, ...morePatterns)` |
| `sequence`, `cat` | `seq(...)`, `cat(...)`; at least one child pattern |
| `silence` | The `silence` value, with no arguments |

A numeric pattern is a number, a validated Mini-Notation string, or a typed
Mini-Notation AST. These modifier groups are currently supported:

| Arguments | Modifier names accepted by `fn` |
| --- | --- |
| One numeric pattern | `gain`, `velocity`, `pan`, `orbit`, `lowPass`, `highPass`, `room`, `size`, `fast`, `slow`, `clip`, `early`, `late`, `swing` |
| Two numeric patterns | `compress`, `swingBy` |
| None | `rev`, `degrade`, `undegrade` |
| Cycle count and callback | `every`, `firstOf`, `lastOf` |
| Callback | `sometimes`, `often`, `rarely` |
| Numeric pattern and callback | `sometimesBy`, `inside`, `outside`, `off` |
| Mini-Notation condition and callback | `when` |

`lowPass` maps to `lpf`; `highPass` maps to `hpf`. Callbacks are serializable
objects, built with `patternCallback(...modifiers)`, rather than JavaScript
functions. `FunctionArguments<'compress'>` and `FunctionResult<'lowPass'>`
provide the corresponding public types.

## Composition and Mini-Notation

`pattern(root, modifiers?)` constructs an expression. `chain(expression,
...modifiers)` appends modifiers without changing the original expression.
`toStrudelCode()` serializes an expression; raw code strings pass through unchanged.

```ts
import { fast, fn, sample, sequence, toStrudelCode } from 'react-strudel-kit'

const rhythm = fast(sequence(sample('bd'), sample('sd')), 2)
toStrudelCode(fn('sample', rhythm))
// s("[bd sd]*2")
```

This example constructs sample code; a sample bank must be loaded before those
sample names can produce audio. The playground's examples instead use the
[built-in synth waveforms](https://strudel.cc/learn/synths/).

Main-entrypoint `fast`, `slow`, `degrade`, `sample`, `stack`, and `sequence` are
**Mini-Notation AST helpers**. Use `fn('fast', 2)` and other registry calls for
Strudel pattern modifiers/factories. `fn('sample', ...)` and `sample('bd')`
therefore create different kinds of values.

AST serialization preserves nested sequence steps, parallel/choice groups,
operator scope, and polymeter lane lengths. `raw(...)` is an opaque escape hatch:
root fragments remain verbatim; nested fragments are enclosed in brackets.
Use typed `sequence(...)` nodes to expose individual steps in a polymeter lane.
`mini()` checks grammar; it does not prove that tokens are existing samples or
valid values for a particular musical control.

See the official [Mini-Notation reference](https://strudel.cc/learn/mini-notation/)
for notation beyond this toolkit's typed subset.

## Compatibility

| Component | Current setup |
| --- | --- |
| React | Peer requirement `>=18`; local checks run with installed React 19.3.0 |
| `@strudel/web` | Pinned to `1.3.0`; adapter targets its returned transport/state APIs |
| `@strudel/mini` | Pinned to `1.2.6` |
| TypeScript | `~6.0.2`, strict mode |
| Node.js | Locally verified on 24.22.0; use Node 24.15+ for this repository's dev/test dependencies |
| Browser | Web Audio in a browser/client component; use localhost or HTTPS |

These describe declared requirements and the locally checked setup, not a
completed cross-version or cross-device test matrix.

## Troubleshooting

- **Nothing plays:** click Play directly or use the keyboard shortcut, check
  browser/site audio permissions, output volume, and the selected output device.
  Try the built-in Melody example to avoid sample-loading dependencies.
- **Code edited but sound unchanged:** press Play again. Editing does not live-evaluate.
- **Sample names produce no sound:** `@strudel/web` does not preload external
  sample banks by default. Follow the [sample-loading instructions](https://strudel.cc/learn/samples/#loading-custom-samples).
- **Session only:** storage was blocked or a write failed. Editing and playback
  still work; copy your code before closing the page.
- **Package changes do not appear:** run `npm run build:package` during dev/watch.
  The playground imports the built package, not duplicate app implementations.
- **Editor cannot find Strudel declarations:** package tests should belong to
  `packages/react-strudel-kit/tsconfig.json`. Build uses `tsconfig.build.json`.
  Restart the TypeScript server if it cached the previous configuration.
