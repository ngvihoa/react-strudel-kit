import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { chain, fn } from 'react-strudel-kit'
import type { PatternExpression } from 'react-strudel-kit'
import source from '../../songs/danceMonkey.ts?raw'
import { DANCE_MONKEY_BPM, DANCE_MONKEY_PARTS, DANCE_MONKEY_PATTERN } from '../../songs/danceMonkey'
import { DANCE_MONKEY } from '../../examples'
import { audibleParts, buildMix, createMixSettings } from '../../mixer'
import type { TrackMix } from '../../mixer'
import { sourceRegion, stripRegions } from '../../content/source'
import { TrackControls } from '../../components/TrackControls'
import { CodeBlock, DocsLayout, PageHeader, Pager, ParamSlider, Player } from '../components'
import { ROUTES, href } from '../router'

const code = (region: string) => sourceRegion(source, region)
const TEMPO = fn('cpm', DANCE_MONKEY_BPM / 4)
const { melody, bass, keys, kick, snare, hats } = DANCE_MONKEY_PARTS

const SECTIONS: readonly { id: string, title: string, solo: { title: string, pattern: PatternExpression }, body: ReactNode }[] = [
  { id: 'melody', title: 'Melody', solo: { title: 'Melody alone', pattern: chain(melody, TEMPO) }, body: <>
    <p>The melody is written like a score, one bar per <code>sequence</code>. Each bar is split into 16 shares — sixteenth
      notes — so <code>weight(…, 2)</code> is an eighth note and <code>weight(…, 4)</code> a full beat. Every bar adds up to 16.</p>
    <CodeBlock source={code('melody-bar-1')} label="Bar 1 of 8" />
    <p><code>fn('cat', …)</code> plays one bar per cycle, so eight bars take eight cycles. The rest of the chain shapes the
      sound: a triangle synth, a soft filter and a short envelope so notes don’t blur together.</p>
    <CodeBlock source={code('melody')} />
  </> },
  { id: 'bass', title: 'Bass', solo: { title: 'Bass alone', pattern: chain(bass, TEMPO) }, body: <>
    <p>The bass uses a coarser grid: eight equal slots per bar, one per eighth note, with no weights. A <code>rest()</code> still
      takes its slot, so the next note stays on the beat. It plays the root of each chord with a jump to the fifth.</p>
    <CodeBlock source={code('bass-bar-1')} label="Bar 1 of 4" />
    <p>Four bars of bass loop twice under the eight-bar melody. A low-pass filter at 650 Hz keeps it dark, out of the melody’s way.</p>
    <CodeBlock source={code('bass')} />
  </> },
  { id: 'keys', title: 'Keys', solo: { title: 'Keys alone', pattern: chain(keys, TEMPO) }, body: <>
    <p>The keys spell out each chord one note at a time. <code>repeat(…, 2)</code> plays the four-note figure twice in the
      same bar — eight quick notes — where <code>weight</code> would have stretched it instead.</p>
    <CodeBlock source={code('keys-bar-1')} label="Bar 1 of 4" />
    <CodeBlock source={code('keys')} />
  </> },
  { id: 'drums', title: 'Drums', solo: { title: 'Drums alone', pattern: chain(fn('stack', kick, snare, hats), TEMPO) }, body: <>
    <p>No samples are downloaded: the kick is a falling sine tone, and the snare and hi-hats are filtered white noise.
      The <a href={href(ROUTES.kick)}>Kick</a> page in the Sound Cookbook takes the kick apart.</p>
    <CodeBlock source={code('drums')} maxLines={20} />
  </> },
  { id: 'mix', title: 'Put it together', solo: { title: 'Full song', pattern: DANCE_MONKEY_PATTERN }, body: <>
    <p><code>stack</code> plays all six parts at once. The song is 98 BPM with four beats per bar, so the tempo is
      98 ÷ 4 = 24.5 cycles per minute.</p>
    <CodeBlock source={code('mix')} />
    <p>The mixer at the top of this page does the same thing from React state: it stacks only the parts you can hear, applies
      each volume and synth, and while music plays hands the new pattern to <code>update()</code> so the song keeps its place.</p>
  </> },
]

const TOC = [{ id: 'try-it', label: 'Try the mix' }, ...SECTIONS.map(({ id, title }) => ({ id, label: title })), { id: 'source', label: 'Full source' }]

export function DanceMonkeyPage() {
  const [mix, setMix] = useState(() => createMixSettings(DANCE_MONKEY))
  const pattern = useMemo(() => buildMix(DANCE_MONKEY, mix), [mix])
  const audible = audibleParts(DANCE_MONKEY, mix)
  const changeTrack = (id: string, change: Partial<TrackMix>) => setMix((current) => ({
    ...current, tracks: { ...current.tracks, [id]: { ...current.tracks[id], ...change } },
  }))

  return (
    <DocsLayout variant="example" toc={TOC}
      header={<PageHeader crumbs={['Examples', 'Full songs']} title="Dance Monkey"
        intro="An eight-bar instrumental chorus in six parts. Mix it first, then read how each part is written."
        meta={['Advanced', DANCE_MONKEY.key, `${DANCE_MONKEY_BPM} BPM`, `${DANCE_MONKEY.bars} bars`]} />}
      asideLabel="About this example"
      aside={<div className="facts">
        <div><p>Techniques</p><ul><li><code>sequence</code> and <code>weight</code> for rhythm</li><li><code>repeat</code> for quick figures</li><li><code>cat</code> for one bar per cycle</li><li><code>stack</code> for layering</li><li><code>update</code> for live mixing</li></ul></div>
        <div><p>Learn first</p><ul><li><a href={href(ROUTES.simpleMelody)}>A simple melody</a></li><li><a href={href(ROUTES.backbeat)}>Backbeat</a></li><li><a href={href(ROUTES.hiHatAccents)}>Hi-hat accents</a></li></ul></div>
      </div>}>
      <section id="try-it" aria-label="Try the mix">
        <Player id="example-dance-monkey" title="Dance Monkey" pattern={pattern} headingLevel={2}
          caption={`${audible.length} of ${DANCE_MONKEY.parts.length} parts on · changes apply while it plays`}>
          <ParamSlider label="Tempo" unit="BPM" value={mix.bpm} min={60} max={160} step={1} hint={['Slower', 'Faster']}
            onChange={(bpm) => setMix((current) => ({ ...current, bpm }))} />
          <div className="track-list player-tracks" role="group" aria-label="Parts">
            {DANCE_MONKEY.parts.map((part) => <TrackControls key={part.id} part={part} mix={mix.tracks[part.id]}
              audible={audible.some((entry) => entry.id === part.id)} onChange={(change) => changeTrack(part.id, change)} />)}
          </div>
          <button className="reset-button" type="button" onClick={() => setMix(createMixSettings(DANCE_MONKEY))}>Reset mix</button>
        </Player>
      </section>
      {SECTIONS.map((section) => (
        <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{section.title}</h2>
          {section.body}
          <Player id={`example-${section.id}`} title={section.solo.title} pattern={section.solo.pattern} compact />
        </section>
      ))}
      <section id="source" aria-labelledby="source-title">
        <h2 id="source-title">Full source</h2>
        <p>Every snippet above is cut from this one file. Melody reference: Popwise teaching score, transposed to F# minor;
          see <code>docs/dance-monkey.md</code> for the musical notes.</p>
        <details className="source-details">
          <summary>Show src/songs/danceMonkey.ts</summary>
          <CodeBlock source={stripRegions(source)} label="src/songs/danceMonkey.ts" maxLines={28} />
        </details>
      </section>
      <Pager previous={{ label: 'House loop', path: ROUTES.house }} />
    </DocsLayout>
  )
}
