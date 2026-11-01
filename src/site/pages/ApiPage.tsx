import type { ReactNode } from 'react'
import {
  choice, degrade, fast, functionRegistry, number, pitch, polymeter, raw, repeat, rest, sample, sequence,
  slow, stack, subcycle, toMiniNotation, weight,
} from 'react-strudel-kit'
import type { FunctionName, MiniNode } from 'react-strudel-kit'
import { Callout, DocsLayout, PageHeader, Toc } from '../components'
import { ROUTES, href } from '../router'
import type { RoutePath } from '../router'

// Every content module, as text. "Used in" below is found by scanning these for fn('name', …),
// so it stays true as examples change.
const SOURCES = import.meta.glob<string>(['../../content/**/*.{ts,tsx}', '!../../content/**/*.test.ts', '../../songs/*.ts'],
  { query: '?raw', import: 'default', eager: true })

const PAGES: readonly { label: string, path: RoutePath, file: string }[] = [
  { label: 'Your first song', path: ROUTES.firstSong, file: 'content/firstSong.ts' },
  { label: 'Drums', path: ROUTES.kick, file: 'content/drums.ts' },
  { label: 'Tonal sounds', path: ROUTES.bass, file: 'content/tonal.ts' },
  { label: 'A simple melody', path: ROUTES.simpleMelody, file: 'content/examples/simpleMelody.ts' },
  { label: 'Four on the floor', path: ROUTES.fourOnTheFloor, file: 'content/examples/fourOnTheFloor.ts' },
  { label: 'Backbeat', path: ROUTES.backbeat, file: 'content/examples/backbeat.ts' },
  { label: 'Hi-hat accents', path: ROUTES.hiHatAccents, file: 'content/examples/hiHatAccents.ts' },
  { label: 'Bass line', path: ROUTES.bassLine, file: 'content/examples/bassLine.ts' },
  { label: 'Chords and arpeggios', path: ROUTES.chords, file: 'content/examples/chords.ts' },
  { label: 'Layer a song', path: ROUTES.layerASong, file: 'content/examples/layerASong.ts' },
  { label: 'Control it with React', path: ROUTES.reactMixer, file: 'content/examples/ReactMixer.tsx' },
  { label: 'Lo-fi loop', path: ROUTES.lofi, file: 'content/examples/lofi.ts' },
  { label: 'House loop', path: ROUTES.house, file: 'content/examples/house.ts' },
  { label: 'Dance Monkey', path: ROUTES.danceMonkey, file: 'songs/danceMonkey.ts' },
]

const sourceOf = (file: string) => SOURCES[`../../${file}`] ?? ''
const usedIn = (name: string) => PAGES.filter((page) => sourceOf(page.file).includes(`fn('${name}'`))

// Typed against the registry: adding a function without documenting it is a compile error.
const ARGUMENTS: Record<FunctionName, string> = {
  sample: 'Mini-Notation', sound: 'Mini-Notation', note: 'Mini-Notation', n: 'number | Mini-Notation',
  stack: 'pattern, …patterns', layer: 'pattern, …patterns', sequence: 'pattern, …patterns', cat: 'pattern, …patterns', silence: '—',
  instrument: 'Mini-Notation', cpm: 'number',
  attack: 'numeric', decay: 'numeric', sustain: 'numeric', release: 'numeric', pitchEnvelope: 'numeric', pitchDecay: 'numeric', postGain: 'numeric',
  gain: 'numeric', velocity: 'numeric', pan: 'numeric', orbit: 'numeric', lowPass: 'numeric', highPass: 'numeric', room: 'numeric', size: 'numeric',
  fast: 'numeric', slow: 'numeric', clip: 'numeric', early: 'numeric', late: 'numeric', swing: 'numeric',
  compress: 'numeric, numeric', swingBy: 'numeric, numeric',
  rev: '—', degrade: '—', undegrade: '—',
  every: 'cycles, callback', firstOf: 'cycles, callback', lastOf: 'cycles, callback',
  sometimes: 'callback', often: 'callback', rarely: 'callback',
  sometimesBy: 'numeric, callback', inside: 'numeric, callback', outside: 'numeric, callback', off: 'numeric, callback',
  when: 'Mini-Notation, callback',
}

const DESCRIPTIONS: Record<FunctionName, string> = {
  sample: 'Plays sound names: a sample, a synth wave or noise.', sound: 'Same as sample.', note: 'Plays pitches.',
  n: 'Plays note numbers.', stack: 'Plays patterns at the same time.', layer: 'Same as stack.',
  sequence: 'Plays patterns one after another within a cycle.', cat: 'Plays one pattern per cycle.', silence: 'Plays nothing.',
  instrument: 'Sets the sound of a note pattern.', cpm: 'Cycles per minute. BPM ÷ 4 for one 4/4 bar per cycle.',
  attack: 'Fade-in time, seconds.', decay: 'Time to fall to the sustain level, seconds.', sustain: 'Level held while a note lasts, 0–1.',
  release: 'Fade-out time after a note ends, seconds.', pitchEnvelope: 'Start pitch above the note, semitones.',
  pitchDecay: 'Time for that pitch to fall back, seconds.', postGain: 'Output level after effects; keeps each gain.',
  gain: 'Loudness.', velocity: 'Scales gain per event, 0–1.', pan: 'Stereo position: 0 left, 0.5 centre, 1 right.',
  orbit: 'Effect bus number.', lowPass: 'Removes frequencies above the cutoff, Hz.', highPass: 'Removes frequencies below the cutoff, Hz.',
  room: 'Reverb amount, 0–1.', size: 'Reverb room size, 0–1.', fast: 'Speeds the pattern up by a factor.', slow: 'Slows the pattern down by a factor.',
  clip: 'Note length as a share of its slot.', early: 'Shifts earlier, cycles.', late: 'Shifts later, cycles.', swing: 'Swings by subdivision.',
  compress: 'Squeezes the pattern into a span of the cycle.', swingBy: 'Delays every second subdivision: amount, subdivisions.',
  rev: 'Reverses each cycle.', degrade: 'Randomly drops events.', undegrade: 'Keeps the events degrade would drop.',
  every: 'Applies a callback every n cycles.', firstOf: 'Applies a callback on the first of every n cycles.', lastOf: 'Applies a callback on the last of every n cycles.',
  sometimes: 'Applies a callback to about half the events.', often: 'Applies a callback to most events.', rarely: 'Applies a callback to a few events.',
  sometimesBy: 'Applies a callback with a probability.', inside: 'Applies a callback inside subdivided cycles.', outside: 'Applies a callback across enlarged cycles.',
  off: 'Adds a time-shifted, transformed copy.', when: 'Applies a callback while a condition is true.',
}

const NAMES = Object.keys(functionRegistry) as FunctionName[]
const FACTORIES = NAMES.filter((name) => functionRegistry[name].kind === 'factory')
const MODIFIERS = NAMES.filter((name) => functionRegistry[name].kind === 'modifier')

// Mini-Notation helpers, each with the notation it produces (computed, not typed by hand).
const MINI_HELPERS: readonly { call: string, node: MiniNode, about: string }[] = [
  { call: "pitch('c4')", node: pitch('c4'), about: 'A note name with octave. Typed: a typo is a compile error.' },
  { call: "sample('white')", node: sample('white'), about: 'A sound name.' },
  { call: 'number(0.5)', node: number(0.5), about: 'A number, for control patterns such as velocity.' },
  { call: 'rest()', node: rest(), about: 'A silent slot.' },
  { call: "sequence(pitch('c4'), rest())", node: sequence(pitch('c4'), rest()), about: 'Splits a slot equally between its entries.' },
  { call: "stack(pitch('c4'), pitch('e4'))", node: stack(pitch('c4'), pitch('e4')), about: 'Plays entries at once: a chord.' },
  { call: "weight(pitch('c4'), 2)", node: weight(pitch('c4'), 2), about: 'Gives an entry more shares of its sequence.' },
  { call: "repeat(pitch('c4'), 2)", node: repeat(pitch('c4'), 2), about: 'Fits several strikes into one slot.' },
  { call: "fast(sequence(…), 2)", node: fast(sequence(pitch('c4'), pitch('e4')), 2), about: 'Plays a slot’s content faster.' },
  { call: "slow(sequence(…), 2)", node: slow(sequence(pitch('c4'), pitch('e4')), 2), about: 'Stretches content over more cycles.' },
  { call: "choice(pitch('c4'), pitch('e4'))", node: choice(pitch('c4'), pitch('e4')), about: 'Picks one entry at random each cycle.' },
  { call: "subcycle(sequence(…))", node: subcycle(sequence(pitch('c4'), pitch('e4'))), about: 'Groups entries into one slot.' },
  { call: 'polymeter(…)', node: polymeter(sequence(pitch('c4'), pitch('e4')), sequence(pitch('g4'), pitch('b4'), pitch('d5'))), about: 'Lanes with different step counts.' },
  { call: "degrade(pitch('c4'), 0.3)", node: degrade(pitch('c4'), 0.3), about: 'Drops the entry with a probability.' },
  { call: "raw('c4 [e4 g4]')", node: raw('c4 [e4 g4]'), about: 'Unchecked Mini-Notation. An escape hatch.' },
]

const SECTIONS = [
  { id: 'entrypoints', label: 'Entrypoints' },
  { id: 'compose', label: 'Composing patterns' },
  { id: 'factories', label: 'Factories' },
  { id: 'modifiers', label: 'Modifiers' },
  { id: 'mini', label: 'Mini-Notation helpers' },
  { id: 'serialize', label: 'Validation and output' },
  { id: 'react', label: 'useStrudel' },
  { id: 'errors', label: 'Errors' },
  { id: 'limits', label: 'Limits' },
]

function UsedIn({ name }: { name: string }) {
  const pages = usedIn(name)
  if (pages.length === 0) return <span className="api-unused">—</span>
  return <>{pages.map((page, index) => <span key={page.path}>{index > 0 && ', '}<a href={href(page.path)}>{page.label}</a></span>)}</>
}

function FunctionTable({ names }: { names: readonly FunctionName[] }) {
  return (
    <div className="table-wrap">
      <table className="anatomy api-table">
        <thead><tr><th scope="col">Name</th><th scope="col">Strudel</th><th scope="col">Arguments</th><th scope="col">What it does</th><th scope="col">Used in</th></tr></thead>
        <tbody>{names.map((name) => <tr key={name} id={`fn-${name}`}>
          <th scope="row"><code>{name}</code></th>
          <td><code>{functionRegistry[name].runtime}</code></td>
          <td>{ARGUMENTS[name]}</td>
          <td>{DESCRIPTIONS[name]}</td>
          <td><UsedIn name={name} /></td>
        </tr>)}</tbody>
      </table>
    </div>
  )
}

function Section({ id, title, children }: { id: string, title: string, children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{title}</h2>{children}</section>
}

export function ApiPage() {
  const nav = <div className="section-nav">
    <div className="section-nav-wide"><Toc items={SECTIONS} /></div>
    <details className="section-nav-narrow"><summary>On this page</summary><div className="section-nav-group"><Toc items={SECTIONS} /></div></details>
  </div>
  return (
    <DocsLayout variant="reference" nav={nav}
      header={<PageHeader crumbs={['API']} title="API reference"
        intro="Every public helper, the functions fn() accepts, and how playback behaves. Tables are generated from the package, and “Used in” links to pages that call each function."
        meta={['react-strudel-kit', 'react-strudel-kit/react']} />}>
      <Section id="entrypoints" title="Entrypoints">
        <div className="table-wrap"><table className="anatomy">
          <thead><tr><th scope="col">Import</th><th scope="col">Contents</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>react-strudel-kit</code></th><td><code>fn</code>, <code>chain</code>, <code>pattern</code>, <code>patternCallback</code>, the registry, Mini-Notation helpers, validation, serializers and types. Builds patterns without audio.</td></tr>
            <tr><th scope="row"><code>react-strudel-kit/react</code></th><td><code>useStrudel</code> and its types. Browser-only; uses the Strudel browser bundle.</td></tr>
          </tbody>
        </table></div>
      </Section>
      <Section id="compose" title="Composing patterns">
        <div className="table-wrap"><table className="anatomy">
          <thead><tr><th scope="col">Helper</th><th scope="col">What it does</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>fn(name, …args)</code></th><td>Creates a factory (a new pattern) or a modifier (a setting). Names and argument types are checked against the registry below.</td></tr>
            <tr><th scope="row"><code>chain(pattern, …modifiers)</code></th><td>Returns a new pattern with modifiers appended. The original is not changed, so a part can be reused with different settings.</td></tr>
            <tr><th scope="row"><code>pattern(root, modifiers?)</code></th><td>Builds an expression from a factory call and modifiers.</td></tr>
            <tr><th scope="row"><code>patternCallback(…modifiers)</code></th><td>A callback for <code>off</code>, <code>every</code> and friends, applied to the implicit pattern <code>x</code>. Serializable data, not a JavaScript function.</td></tr>
          </tbody>
        </table></div>
        <p>See them in use: <a href={href(ROUTES.firstSong)}>Your first song</a> and the <a href={href(ROUTES.lead)}>Lead</a> page for callbacks.</p>
      </Section>
      <Section id="factories" title="Factories">
        <p>A factory starts a pattern. Use it first in <code>chain</code>, or as an argument to <code>stack</code> and <code>cat</code>.</p>
        <FunctionTable names={FACTORIES} />
      </Section>
      <Section id="modifiers" title="Modifiers">
        <p>A modifier changes a pattern and goes after the factory in <code>chain</code>. “Numeric” accepts a number, a
          validated Mini-Notation string, or a typed Mini-Notation node, so most settings can be patterns too.</p>
        <FunctionTable names={MODIFIERS} />
      </Section>
      <Section id="mini" title="Mini-Notation helpers">
        <p>These build typed Mini-Notation that goes inside a factory, such as <code>fn('note', …)</code>. The right-hand column is the notation each one produces.</p>
        <Callout kind="note" title="Two kinds of fast, stack and sequence">
          The helpers here are Mini-Notation nodes. <code>fn('fast', 2)</code>, <code>fn('stack', …)</code> and <code>fn('sequence', …)</code> are
          pattern functions from the registry. They have the same names but work on different kinds of values.
        </Callout>
        <div className="table-wrap"><table className="anatomy">
          <thead><tr><th scope="col">Call</th><th scope="col">What it does</th><th scope="col">Produces</th></tr></thead>
          <tbody>{MINI_HELPERS.map((helper) => <tr key={helper.call}>
            <th scope="row"><code>{helper.call}</code></th><td>{helper.about}</td><td><code>{toMiniNotation(helper.node)}</code></td>
          </tr>)}</tbody>
        </table></div>
      </Section>
      <Section id="serialize" title="Validation and output">
        <div className="table-wrap"><table className="anatomy">
          <thead><tr><th scope="col">Function</th><th scope="col">What it does</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>mini(code)</code></th><td>Checks Mini-Notation syntax with Strudel’s parser and returns it typed. Throws on invalid syntax.</td></tr>
            <tr><th scope="row"><code>isMiniNotation(code)</code></th><td>The same check as a type guard that returns a boolean.</td></tr>
            <tr><th scope="row"><code>assertMiniNotation(code)</code></th><td>The same check as an assertion function.</td></tr>
            <tr><th scope="row"><code>toMiniNotation(node)</code></th><td>Turns a typed Mini-Notation node into its string.</td></tr>
            <tr><th scope="row"><code>toStrudelCode(input)</code></th><td>Turns a pattern into Strudel code — what every “Strudel output” tab on this site shows. Code strings pass through.</td></tr>
          </tbody>
        </table></div>
      </Section>
      <Section id="react" title="useStrudel">
        <p><code>useStrudel()</code> takes no arguments. Every component that calls it shares one transport; no provider is needed.</p>
        <div className="table-wrap"><table className="anatomy">
          <thead><tr><th scope="col">Member</th><th scope="col">Behavior</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>play(input)</code></th><td>Starts playback of a code string, a pattern from this package, or a native Strudel pattern. Call it from a click or key press so the browser allows audio. A newer call replaces an older pending one.</td></tr>
            <tr><th scope="row"><code>update(input)</code></th><td>Replaces the running pattern without restarting. Does nothing while stopped. Takes effect in the next scheduling window, not on a bar line.</td></tr>
            <tr><th scope="row"><code>stop()</code></th><td>Stops playback, cancels pending requests and clears the error.</td></tr>
            <tr><th scope="row"><code>status</code></th><td><code>'idle'</code>, <code>'playing'</code> or <code>'error'</code>. <code>idle</code> also covers start-up.</td></tr>
            <tr><th scope="row"><code>error</code></th><td>A <code>StrudelError</code> or <code>null</code>. Playback failures appear here rather than being thrown.</td></tr>
          </tbody>
        </table></div>
        <p>When the last component using the hook unmounts, playback stops. <a href={href(ROUTES.reactMixer)}>Control it with React</a> shows the full pattern.</p>
      </Section>
      <Section id="errors" title="Errors">
        <div className="table-wrap"><table className="anatomy">
          <thead><tr><th scope="col">code</th><th scope="col">Meaning</th></tr></thead>
          <tbody>
            <tr><th scope="row"><code>initialization</code></th><td>Strudel could not start. Press Play again to retry.</td></tr>
            <tr><th scope="row"><code>evaluation</code></th><td>A pattern could not be serialized or the code failed to evaluate.</td></tr>
            <tr><th scope="row"><code>transport</code></th><td>Resuming audio, preparing a native pattern, starting or stopping failed.</td></tr>
            <tr><th scope="row"><code>unknown</code></th><td>Reserved fallback.</td></tr>
          </tbody>
        </table></div>
        <p>Each error has a <code>message</code> and an optional original <code>cause</code>.</p>
      </Section>
      <Section id="limits" title="Limits">
        <ul>
          <li>Types cover the functions listed here, not all of Strudel. <code>raw()</code> and code strings are not checked.</li>
          <li><code>mini()</code> checks syntax only. It cannot tell whether a sample exists or a value makes musical sense.</li>
          <li>Sample banks are not loaded. Every sound on this site uses built-in synths and noise; see the <a href="https://strudel.cc/learn/samples/" target="_blank" rel="noreferrer">Strudel sample guide</a> to load your own.</li>
          <li>Changing <code>cpm</code> with <code>update()</code> rescales against the running clock, so the phrase position can move.</li>
          <li>Pinned to <code>@strudel/web</code> 1.3.0. See <code>docs/usage.md</code> for the compatibility table.</li>
        </ul>
      </Section>
    </DocsLayout>
  )
}
