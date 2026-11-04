# Website design and validation

## Direction

One motif, seed 1241963431. Retain Be Vietnam Pro, JetBrains Mono for code,
and the existing indigo brand. No redraw. On this page, the kit's four-slot
Mini-Notation sequence becomes a playable strip that repeats in the page rhythm.
The live interaction is a four-note melody: change its waveform and tempo, then
play or stop it with the shared browser transport.

## Product facts and argument

- Typed `fn` calls validate declared function names and arguments.
- Mini-Notation has typed AST helpers and a parser-backed string helper.
- Patterns serialize to Strudel code.
- React playback has a separate import, `react-strudel-kit/react`.
- `useStrudel` shares a transport across consumers.
- The runtime loads on the first Play gesture.
- Live controls update a running pattern; stopped controls do not autoplay.
- Lessons progress from notes through rhythm and arrangement to React.
- Seven sound recipes use built-in synths and noise.
- Examples include lo-fi, house and a working React mixer.
- The API reference links functions to pages that use them.
- Clean article URLs retain direct visits and reloads.

Show composition becoming sound first, then prove discovery through real interface
captures, and finish with the install command. No usage counts or testimonials.

## Copy deck

- Hero: “Turn code into music.”
- Support: “Compose Strudel patterns in TypeScript. Bring them to life with React.”
- Action: “Start making music” → first lesson.
- Demo: “Four notes. Your sound.” Change waveform and tempo; Play starts audio.
- Discovery: “Follow your curiosity.” Lessons, sounds, examples and API share Docs.
- Close: “Make something worth hearing.” Install the published package.

## Assets

Landing images are captures of this repository's working interface, not stock
photography or invented product mockups. They remain repository website assets;
no development notes or screenshots are added to the npm package.

## Validation

Visual review at 1440, 768, 390 and 375px, with the site shell also checked at
1920px. Retain indigo explicitly (`--allow palette-purple`) because it is the
existing project brand. The live audio demo serves the subject better than an
unrelated stock video; no video is embedded. Motion stays limited to the opening
sequence, pointer feedback and discovery preview, with a reduced-motion path.

### Review rounds

ROUND 1
Seen in one second: typed music composition with a playable four-note instrument.
Idea: the actual Mini-Notation slots form the page's main visual device.
Live thing: mute a note, change the synth or tempo, and hear the result.
Layout: hero=split instrument / composition=source proof / discovery=index and preview / close=install.
Scores: design 6.5 · usability 7 · creativity 7 · content 8 → overall 6.0 (inspection cap).
Top problems: low-contrast tempo hints on indigo; four identical filled discovery
rows; code inheriting a third browser monospace face.
Fixes: white control labels, one selected discovery row, explicit inherited code font.

ROUND 2
Seen in one second: code becomes an instrument, with a clear route into the lessons.
Idea and live thing: unchanged, now supported by a quieter discovery index.
Layout: desktop keeps the paired compositions; phones show every preview inline.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6.
Remaining limits: screenshots are illustrative at phone size; follow the links for
readable, working controls. The motif is a familiar sequencer interpretation.
No stock assets, testimonial placeholders or claims of user adoption are present.

### Asset provenance

All four images were captured from this repository's own interface (project
copyright holders, AGPL-3.0-or-later); there are no external creators or stock
licenses to credit. Their source pages are linked directly by the discovery rows:

| File | Source | Captured region |
| --- | --- | --- |
| `src/assets/landing/keys.png` | `/cookbook/keys` | `.docs-aside .player` |
| `src/assets/landing/lofi.png` | `/examples/lofi-loop` | `#chords` |
| `src/assets/landing/react.png` | `/examples/react-mixer` | `.react-mixer` |
| `src/assets/landing/api.png` | `/api` | `#compose` |

Captures use a 1280×960 viewport at device scale 1.5 with fonts ready and animations
disabled. Recapture affected images when these interfaces change. The hero is real
HTML controls, not an image. No photographic stand-ins or launch placeholders.

### Final checks

20 Vitest files / 189 tests; lint; typecheck; production build; all 47 Chromium
browser tests passed. The final landing test was rerun after hover-state contrast
and clipboard-label corrections, with axe checking the playing and copied states.
Design inspector: zero failures at 1440, 768, 390 and 375px; two retained warnings
(no video, restrained motion) are explained above. npm pack dry-run found no
internal documentation or website screenshots among the 48 package files.
