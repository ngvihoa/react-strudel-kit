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
- Live listening level uses calibrated postGain, preserving each part's gain and accents.
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

## Header, motion and Docs corrections — 2026-11-04

Reference review: the live headers of [Mantine](https://mantine.dev/) and
[TanStack](https://tanstack.com/) separate product identity, internal navigation
and project links. Apply that hierarchy here: wordmark, Home/Docs/Playground,
then explicit GitHub and npm links. On phones the header uses two rows; the
GitHub mark and readable npm label remain available. The GitHub mark comes from
[GitHub's own favicon](https://github.githubassets.com/favicons/favicon.svg).
Lucide icons identify the five sidebar groups rather than decorating every article.

Anime.js replaces the short CSS entrance. Hero elements move 20px and fade over
1100ms, with 110ms stagger after an initial 100ms delay. Lower section groups
move 18px over 900ms with 90ms stagger, triggered once when they enter the
viewport. Focus also reveals a group. The record rotates in 16 seconds only
while playback is active. Reduced motion displays all content immediately and
disables rotation. Following [Anime.js React guidance](https://animejs.com/documentation/getting-started/using-with-react/),
the landing owns a scope that reverts transient styles and animations on cleanup;
observers/listeners are disconnected on route and motion-preference changes.
Anime.js and Lucide are website dependencies, not package dependencies.

The Docs footer now belongs to the content column, so the sticky sidebar cannot
end on top of a footer spanning underneath it. Quick access uses Anime.js for
pointer jumps and pins the selected destination until arrival. Wheel, touch or
navigation keys cancel the jump and restore manual scrollspy; keyboard and
reduced-motion jumps are immediate. Active links keep the same font weight to
avoid line-wrap changes. Footer, navigation and TOC do not receive scroll reveals.

FAQ disclosures retain native `details`/`summary` semantics. Anime.js coordinates
the answer fade, chevron rotation and a measured expansion (320ms opening,
240ms closing, `out(3)`). This bounded accordion deliberately animates height so
following questions move with the answer; it restores automatic height afterward
for responsive text. Repeated clicks retarget from the current position. Keyboard
and reduced-motion toggles are immediate; closing answers become inert until
hidden. Timelines and preference listeners are cleaned up on unmount.

FAQ validation: all three motion browser tests, the 40 site unit tests, lint,
typecheck and production build passed. Browser coverage includes interrupted
toggles, keyboard activation, live reduced-motion changes, route cleanup and an
axe check with all answers open at 375px. Desktop/mobile renders were inspected.

## Landing listening level — 2026-11-04

The owner reported quiet playback even at 100%. That slider previously restored
the arrangements' conservative output, rather than providing a calibrated demo
level. The home player now maps 0–100% to postGain 0–2.1 for Lo-fi and 0–1.6 for
House. Relative to their original 0.85/0.75 postGain, this adds about 7.9/6.6 dB
at maximum. The initial slider stays at 70%. Per-event velocity is preserved;
the slider no longer overwrites the hi-hat accents or echoed notes' velocities.
Strudel output shows the actual applied level. Cookbook/examples and package
defaults are unchanged. See the PCM measurement bounds in `validation.md`.
