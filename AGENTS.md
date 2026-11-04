# AGENTS.md — context for coding agents

Handoff written 2026-11-02 at commit `be7b753`. The "Status" and "Next" sections
describe that moment; check `git log` and `docs/implementation-plan.md` for anything newer.

## What this repo is

- **`packages/react-strudel-kit/`** — a private TypeScript library for building
  [Strudel](https://strudel.cc) music patterns with type checking (`fn`, `chain`,
  Mini-Notation AST helpers, serializers) plus a React hook `useStrudel` (entrypoint
  `react-strudel-kit/react`). Strudel owns the pattern engine and audio; the kit is the
  typed layer and React integration. Not published; license still undecided (Strudel is AGPL).
- **`src/`** — a Vite + React reference app. Originally a playground (mixer + code
  editor); it is now a **learning site** for the kit: Learn, Sound Cookbook, Examples,
  API reference and the original Playground.
- **`docs/implementation-plan.md`** (Vietnamese) is the roadmap. The top section
  "Cập nhật 2026-10-20" holds the current checklist. `docs/usage.md` is the
  authoritative description of the library's behavior.

The owner writes to agents in Vietnamese. Site UI and lesson copy are **English** for now;
a Vietnamese option is planned (see "Ngôn ngữ nội dung" in the plan) — don't start it unasked.

## Commands

```bash
npm install
npm run dev            # builds the package first (predev), then Vite on :5173
npm test -- --run      # builds the package (pretest), then the full Vitest suite
npm run typecheck      # package build + tsc for app, package tests, public-API type tests
npm run lint
npm run build
npm run build:package  # rerun after editing packages/react-strudel-kit/src during dev/test watch
```

At handoff: 18 test files / 160 tests pass; lint and typecheck are clean (run on Node
v26.13.0; the README asks for Node 24.15+). `.claude/launch.json` is a dev-server config
for Claude's preview browser and can be ignored.

## npm publication boundary — owner instruction

**Keep all internal and package-development material in the repository. Do not
publish it with the npm package or put it in the npm-facing README/description.**

- The package README is for consumers: installation from npm, usage, public API,
  examples, concise compatibility requirements, documentation links and license.
- Repository setup, local workspace/tarball installation, build/test commands,
  architecture notes, development plans, validation logs, CI configuration,
  publishing/authentication instructions and agent handoffs belong in repository
  documentation such as `docs/release-plan.md` and `docs/validation.md`.
- Exclude agent instructions (`AGENTS.md`, `.claude/`, etc.), tests, mocks,
  fixtures, development/build/release scripts, tooling configs and internal docs
  from the tarball. Keep the package `files` allowlist limited to consumer
  distribution files: production runtime, declarations/maps and required source,
  public assets, LICENSE, consumer README and consumer-facing CHANGELOG.
- Review the actual `npm pack` file list and the contents of README/CHANGELOG
  before every publish. A file allowlist alone does not prevent internal notes
  from leaking into a README that npm always includes and displays.
- Do not copy repository development or release instructions into the package
  README for convenience. Keep maintainer workflow details in the repository;
  publish release notes that describe changes relevant to package consumers.

## Layout of the learning site

```text
src/
  main.tsx               Fonts (@fontsource Be Vietnam Pro, JetBrains Mono) + <Site />
  index.css              Design tokens (colors, radii, --header) and globals
  App.tsx / App.css      The original Playground (mixer + code editor), rendered at #/playground
  site/
    Site.tsx             Header, section nav (sliding underline), route → page map, footer
    router.ts            ROUTES (hash routes) + useRoute + href
    navigation.ts        Sidebar groups per section; items without `path` render as "Soon"
    components.tsx       Player, ParamSlider, ParamSelect, CodeBlock, Callout, SectionNav,
                         DocsLayout, PageHeader, Toc, Pager
    templates.tsx        SoundArticle (Cookbook page) and ExampleArticle (example page), config-driven
    playback.ts          usePlayer + owner context; PlaybackProvider.tsx provides it
    pages/               LessonPage, cookbook.tsx (7 sound configs), examples.tsx (9 example
                         configs), DanceMonkeyPage, ReactMixerPage, ApiPage
    site.css             All site styles
  content/
    firstSong.ts         Lesson 1 patterns
    drums.ts             Kick/snare/hi-hat sounds + KICK and NOISE source tokens
    tonal.ts             Bass/keys/lead/pad sounds + CHORDS (C, Am, F, G)
    examples/*.ts(x)     One module per example; ReactMixer.tsx is a real component
    source.ts            sourceRegion() / stripRegions()
    content.test.ts      Music claims verified against the real Strudel engine
  songs/danceMonkey.ts   The Dance Monkey arrangement (has #regions for its page)
```

Routes: `/learn/first-song`; `/cookbook/{kick,snare,hi-hat,bass,keys,lead,pad}`;
`/examples/{simple-melody,four-on-the-floor,backbeat,hi-hat-accents,bass-line,chords-and-arpeggios,layer-a-song,react-mixer,lofi-loop,house-loop,dance-monkey}`;
`/api`; `/playground` (default for unknown hashes).

## Conventions — follow these

1. **Code shown on a page must be the code that plays.** Pages import a content module
   and the same file with `?raw`, then cut snippets with `sourceRegion(source, 'name')`,
   delimited by `// #region name` … `// #endregion` lines. Full-file views use
   `stripRegions`. Never paste code into JSX by hand. CodeBlock's "Strudel output" tab
   shows `toStrudelCode(pattern)` for the live values.
2. **Sound and rhythm are separate.** A sound is `(settings) => PatternModifierCall[]`
   (e.g. `kickSound`, `bassSound`). Rhythm and notes are written where the sound is used:
   `chain(fn('note', sequence(KICK, rest(), …)), ...kickSound(KICK_DEFAULTS))`. Examples
   reuse Cookbook sounds and override settings with spreads (`{ ...KICK_DEFAULTS, decay: 0.2 }`).
3. **Every claim the page text makes about timing or harmony gets a test** in
   `src/content/content.test.ts`. That file runs patterns through Strudel's real engine
   (`m` from `@strudel/web/dist/index.mjs`, no audio). Several page sentences were wrong
   until checked this way.
4. **Adding a page:** add a ROUTE, a nav item in `navigation.ts`, and an entry in `PAGES`
   in `Site.tsx` (`satisfies Record<RoutePath, …>` makes a missing page a compile error).
   Keep the Pager chain consistent: Examples run simple-melody → … → house-loop → dance-monkey;
   Cookbook runs kick → … → pad. Add it to the `it.each` list in `src/site/Site.test.tsx`.
   If the page has a content module, add it to `PAGES` in `ApiPage.tsx` so "Used in" finds it.
5. **API page tables are typed against the registry.** `ARGUMENTS` and `DESCRIPTIONS` are
   `Record<FunctionName, string>`: adding a function to `functionRegistry` without
   documenting it fails to compile. "Used in" is computed by scanning content sources
   (`import.meta.glob`) for `fn('name'`.
6. **Audio behavior:** sound starts only from a user gesture (Play). Changing a control
   while stopped never starts playback; while playing, changes go through `update()`. Only
   the player that started playback shows "Playing" (owner context in `playback.ts`).
   `Site` calls `stop()` on every route change. The React example page renders
   `ReactMixer` with raw `useStrudel` — **don't put a site `Player` on that page**, or two
   UIs will disagree about who is playing.
7. **Don't present planned work as available.** Nav items without a path show "Soon"; a
   Pager `next` without a path shows "Next · soon".
8. **Design:** tokens live in `src/index.css`. Brand is indigo `#472dd7`; lavender `#b3a6f9`
   is decorative only (2.2:1 on white, not for text). Status colors (ok/warn/danger) stay
   separate from brand. The header nav has no rounded corners and a sliding underline; the
   rest uses 8/12px radii. Proportions follow react.dev / Tailwind / Next.js docs:
   60px header, 272px sidebar, 720px reading column (960px on `/api`). Check desktop
   (1440), tablet (768) and mobile (375) with no horizontal page scroll. The logo is
   `src/assets/rsk-logo.png` (cropped from `rsk-logo.png`); there is no SVG yet.
9. **Match the surrounding style:** no semicolons, single quotes, 2-space indent in `src/`
   (the package uses 4 spaces), and short comments that explain why.

## Gotchas found the hard way

- `repeat(node, n)` serializes to `node*n`: n strikes **inside one slot**, not n extra slots.
  To give two strikes half a bar, use `weight(repeat(pitch('c4'), 2), 2)` → `[c4*2]@2`.
- `fn('cat', a, b, …)` plays one child per cycle. Mini-Notation `stack(...)` inside
  `fn('note', …)` makes a chord (`"c4, e4, g4"`). Main-entrypoint `fast/slow/stack/sequence/sample`
  are Mini-Notation helpers, not the registry functions of the same name.
- Accents and mix balance use `velocity` (it scales gain). Setting `gain` twice overrides.
- `off(t, patternCallback(...))`: the callback changes only the shifted copy. `t` is in
  cycles (0.125 = half a beat in 4/4).
- The CSS `font` shorthand resets ligature settings, so `index.css` disables code
  ligatures with `!important`. Keep it, or `=>` renders as `⇒`.
- jsdom has no `ResizeObserver`, `IntersectionObserver`, `scrollTo` or `scrollIntoView`.
  The code guards the first two; tests stub `scrollTo`.
- After deleting or renaming modules, Vite HMR can keep serving stale code — reload the page.
- No sample banks are loaded. Every sound uses built-in waveforms (`sine`, `triangle`,
  `square`, `sawtooth`) or `white` noise. Sample names will be silent.
- Mobile header: five sections fit at 375px only because "Sound " is hidden
  (`.nav-long`). A sixth section needs a different mobile nav.

## Status at handoff (plan checklist)

Done (steps 1–5): UI template and design system; navigation integrating the
playground; Lesson 1 and the Dance Monkey page; basic examples plus Kick/Snare/Hi-hat;
Bass/Keys/Lead/Pad, harmony/arrangement/React/style examples, API reference, README sync.

**Nothing has been verified by ear.** Tests cover logic, timing and harmony only. Default
gains, filter values and slider ranges were chosen on paper.

## Next

1. **Step 6 of the plan (last item):** audit navigation, responsive layout, keyboard use
   (tab order, focus visibility, slider and Play/Stop by keyboard) and audio lifecycle
   across all pages. Check that sample code runs, that parameters change the sound as the
   text says, and that `#/playground` still works. Consider Playwright browser tests for
   Play → Stop, route change stops audio, and no horizontal scroll at 375px.
2. **Listening pass with the owner:** tune gains, defaults and slider ranges per page
   (the tonal Cookbook, Lo-fi and House are the riskiest). Keep page text and tests in
   sync with any change.
3. **Planned pages still marked "Soon":** lessons "Make a beat", "Add a bass line",
   "Layer the parts", "Control it with React".
4. **Housekeeping:** replace the PNG logo and favicon with SVG once a vector source exists.
   Investigate the 18 `npm audit` findings (14 moderate, 4 high) reported after the font
   packages were added; whether they predate them is unknown. Look into the large-chunk
   warning from `npm run build` (Strudel could be lazy-loaded).
5. **Later, only when asked:** the Vietnamese language option; license choice and package
   release (plan milestones 6+).

## Documentation audiences

- `README.md` is the consumer entrypoint: installation, a first working pattern,
  compatibility and links to explore the website. Keep maintainer workflows out.
- Read `docs/development.md` for local setup, repository structure and validation;
  `docs/release-plan.md` for publishing; `docs/website-design.md` for the website direction.
- `/` is the landing page, `/docs` is the shared documentation entrypoint, and
  `/playground` is the mixer/editor. Lessons, sounds, examples and API share the
  Docs sidebar. Preserve their existing URLs and the legacy hash migration.
- Cap the site shell at 1280px; verify 375px, 768px and wide desktop layouts.

## Website priorities — owner feedback 2026-11-04

- Treat the home page as an npm library landing page: visible package name and
  install command in the first screen, followed by documentation and useful proof.
- Use rounded surfaces. Do not follow a design skill's square-corner preference
  or picture-count requirement when it conflicts with this brief.
- The owner selected existing Lo-fi + House arrangements for the landing demo.
  Keep a deliberate Play gesture, live updates and source-backed code.
- Do not restore the hover screenshot gallery. Prefer useful live UI and direct
  learning links. Keep a full footer with package, Docs, project and license links.
- Keep the Docs section index visible in a separate sticky right rail on desktop,
  with an inline alternative on narrower screens; do not hide it to fit 1280px.
- Use Anime.js for landing motion: gradual hero entrance, once-per-visit section
  reveals and a record that rotates only during playback. Honor reduced motion
  and revert scopes/listeners on unmount. See `docs/website-design.md` for timings.
- Keep GitHub and npm directly accessible in the header. Sidebar icons belong
  on group headings; the Docs footer stays inside the content column.
- During a clicked section jump, keep quick access on the chosen destination;
  resume scrollspy after arrival or interruption. Avoid changing text metrics
  between active/inactive TOC items.
