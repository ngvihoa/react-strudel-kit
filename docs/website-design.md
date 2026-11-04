# Package website direction

## Current brief — 2026-11-04 revision

The owner rejected the earlier four-note hero, screenshot hover gallery, square
surfaces, understated footer and missing right-hand Docs index. Passing layout
and accessibility checks did not establish that the design served the product.

This is a landing page for **react-strudel-kit**, an npm library. Its first screen
must identify the package, explain what it adds to Strudel, and offer installation
and documentation. The owner selected the existing Lo-fi and House arrangements
for the listening demo. Keep the 1280px shell and the shared Docs sidebar.

## Research and direction

Live official references inspected on 2026-11-04:

- [Motion](https://motion.dev/): library identity, explanation, install command and
  Get started action in the first screen; demonstrations then prove the API.
- [React Spring](https://www.react-spring.dev/): installation and documentation
  entrypoint in the hero, with interactions demonstrating the subject.
- [Tone.js](https://tonejs.github.io/): a clear statement of the audio library's
  role, installation and working musical examples.

These are references for information hierarchy, not evidence that a visual style
is universally popular or that their layouts should be copied.

Taste-skill draw: `borrowed-category` / “Dressed as something else”, seed 91394382.
The borrowed category is a listening session: the kit's real arrangements become
a record-and-code workspace. Installation comes before the listening session.
No further direction redraw. The photo slot becomes the working player, since
this brief rejects screenshot-led presentation and needs an audible demonstration.

## Product inventory and argument

- The public package name is `react-strudel-kit`.
- The RSK mark is an existing project asset.
- Strudel provides the engine; the kit provides typed composition and React integration.
- `fn` and `chain` build serializable typed patterns.
- React playback comes from `react-strudel-kit/react`.
- The engine loads on a Play gesture; stopped controls never autoplay.
- Lo-fi and House already exist as source-backed arrangements.
- The Lo-fi sound was previously accepted by the owner.
- Live listening level uses velocity, preserving the arrangements' master headroom.
- The shared Docs area has lessons, sound recipes, examples and API reference.
- Clean URLs and the Playground remain available.
- AGPL-3.0-or-later and the upstream Strudel relationship must be discoverable.

Claims and proof: hero → package identity and install; session → real music and
its source; next steps → specific learning paths; questions → actual requirements
and integration limits; footer → documentation, npm, GitHub, feedback and license.

## Copy and interaction

- Identity: react-strudel-kit.
- Hero: “Make music with React.”
- Install: `npm install react-strudel-kit`, with working copy feedback.
- Session: “A little code. A whole groove.” Lo-fi and House are complete arrangements.
- Controls: style selection, Play/Stop and listening level. No autoplay.
- Code: extracted from the exact arrangement module. Strudel output includes the
  current listening level. Links open the full arrangement and its constituent sounds.
- Discovery: “Your next musical idea.” Concrete text links replace hover screenshots.
- Footer: package identity, Explore and Project groups, Strudel attribution and license.

## Brand and deliberate skill exceptions

Keep Be Vietnam Pro, JetBrains Mono for code, and the existing indigo brand.
Surfaces use 20–24px radii and controls 9–14px, following the owner's request for
softer corners instead of the skill's preference for square corners.

The owner's rejection of screenshot presentation takes priority over the skill's
four-picture floor. No screenshot gallery, stock photographs or unrelated video
are introduced to satisfy a count. Inspection records `--allow few-pictures` and
`--allow palette-purple` openly. The sole bitmap is the existing project logo
(project copyright holders, AGPL-3.0-or-later); the record is CSS, not photography
or a fabricated waveform. It turns only while playing, with rotation disabled when reduced motion is requested.
No fictional customers, usage statistics, reviews or placeholder content.

## Docs layout

The section index is separate from cookbook players and example facts. At desktop
width it occupies a 168px sticky rail on the right. Below 1180px it flows above the
article; it is not hidden. Existing article URLs, players, shared navigation and
keyboard section jumps continue working. The Playground footer styles are scoped
so they cannot dictate the layout of the site footer.

## Visual review

Round 1: installation and identity now lead, but the tablet footer inherited a
Playground `display:flex` rule, squeezing its brand and project links. Scope that
rule to the app; keep the site footer's own grid. Remove redundant compatibility
metadata between hero and demo, and keep the install command within the phone width.

Round 2: inspected full-page renders at 1440, 768, 390 and 375px. The hero has two
lines, the install command is on the first screen, the listening session stacks on
phones, and the footer has readable grouped links at all widths. No screenshot
assets remain. The record is intentionally an illustration of playback, not a
claim to visualize the timing or spectrum of the audio.

Self-review: design 7, usability 8, creativity 7, content 8 → 7.4/10 under the brief's
explicit imagery exception. This is an internal critique, not a user acceptance
score or an external award. Remaining limitation: synth playback quality still
requires human listening on actual devices; automated checks cannot judge it.

Inspector note: on phones it misclassifies the hero's actual “Get started” action
as a pill eyebrow above the following section. The action belongs inside the hero
and is required for the package entrypoint; it is not a section label. Retain it
and record `--allow eyebrow` for this specific false positive, alongside the
explicit brand and imagery exceptions. Type-size count, no video and restrained
motion remain review warnings, not claims that more decoration would improve use.

## Validation record

189 unit tests in 20 files passed; lint, typecheck and production build passed.
The full Chromium run reported all 48 tests passing; the final targeted landing
and sticky-index run also passed with exit code 0. Axe checks cover every route
at 375px and 1440px, plus playing and copied states on the landing page. Route
coverage includes direct visits, reloads, legacy bookmarks, live audio updates,
keyboard operation and no horizontal page overflow through 1920px.

Final taste inspection: zero failures with the three documented allowances;
remaining warnings are font-size count, no video and restrained motion. Source
lint has no failures, with the conventional library “Get started” wording retained.
