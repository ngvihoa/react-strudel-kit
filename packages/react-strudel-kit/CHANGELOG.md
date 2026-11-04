# Changelog

## 0.1.0

Initial release:

- Typed pattern factories and modifiers through the supported function registry.
- Mini-Notation AST builders, parser validation and Strudel serialization.
- Separate React entrypoint with shared playback state, play/update/stop,
  normalized errors, pending-play cancellation and final-consumer cleanup.
- Lazy runtime loading with browser audio unlocked from the Play gesture.
- ESM and strict TypeScript declarations for bundler and NodeNext resolution;
  declaration maps and production source included.
- Isolated tarball consumers verified with React/React DOM 18.3.1 and 19.3.0.

The React hook requires a browser/client component and user activation for audio.
No CommonJS build or sample banks are included. The function registry covers a
documented subset of Strudel; raw code is not statically validated.

License: AGPL-3.0-or-later. Runtime dependencies are pinned to
`@strudel/web@1.3.0` and `@strudel/mini@1.2.6`.
