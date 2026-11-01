import { useMemo, useState } from 'react'
import source from '../../songs/danceMonkey.ts?raw'
import { DANCE_MONKEY } from '../../examples'
import { audibleParts, buildMix, createMixSettings } from '../../mixer'
import type { TrackMix } from '../../mixer'
import { TrackControls } from '../../components/TrackControls'
import { CodeBlock, DocsLayout, PageHeader, Pager, ParamSlider, Player, SectionNav } from '../components'
import { EXAMPLES_NAV } from '../navigation'
import { ROUTES, href } from '../router'

export function ExamplePage() {
  const [mix, setMix] = useState(() => createMixSettings(DANCE_MONKEY))
  const pattern = useMemo(() => buildMix(DANCE_MONKEY, mix), [mix])
  const audible = audibleParts(DANCE_MONKEY, mix)
  const changeTrack = (id: string, change: Partial<TrackMix>) => setMix((current) => ({
    ...current, tracks: { ...current.tracks, [id]: { ...current.tracks[id], ...change } },
  }))

  return (
    <DocsLayout variant="example"
      nav={<SectionNav groups={EXAMPLES_NAV} current={ROUTES.example} label="Examples" />}
      header={<PageHeader crumbs={['Examples', 'Full songs']} title="Dance Monkey"
        intro="An eight-bar instrumental chorus in six parts. Take parts out, solo them, and read how each one is written."
        meta={['Advanced', DANCE_MONKEY.key, `${DANCE_MONKEY.bars} bars`, `${DANCE_MONKEY.parts.length} parts`]} />}
      asideLabel="About this example"
      aside={<div className="facts">
        <div><p>Goal</p><p>See how small, readable parts stack into a full arrangement.</p></div>
        <div><p>Techniques</p><ul><li><code>sequence</code> and <code>weight</code> for rhythm</li><li><code>cat</code> for one bar per cycle</li><li><code>stack</code> for layering</li><li><code>update</code> for live mixing</li></ul></div>
        <div><p>Learn first</p><ul><li><a href={href(ROUTES.lesson)}>Your first song</a></li><li><a href={href(ROUTES.cookbook)}>Kick</a></li></ul></div>
      </div>}>
      <Player id="example-dance-monkey" title="Dance Monkey" pattern={pattern}
        caption={`${audible.length} of ${DANCE_MONKEY.parts.length} parts on · changes apply while it plays`}>
        <ParamSlider label="Tempo" unit="BPM" value={mix.bpm} min={60} max={160} step={1} hint={['Slower', 'Faster']}
          onChange={(bpm) => setMix((current) => ({ ...current, bpm }))} />
        <div className="track-list player-tracks" role="group" aria-label="Parts">
          {DANCE_MONKEY.parts.map((part) => <TrackControls key={part.id} part={part} mix={mix.tracks[part.id]}
            audible={audible.some((entry) => entry.id === part.id)} onChange={(change) => changeTrack(part.id, change)} />)}
        </div>
        <button className="reset-button" type="button" onClick={() => setMix(createMixSettings(DANCE_MONKEY))}>Reset mix</button>
      </Player>
      <section aria-labelledby="dm-code">
        <h2 id="dm-code">The code</h2>
        <p>The full song file. The melody is written bar by bar so you can follow it like a score.</p>
        <CodeBlock source={source} label="src/songs/danceMonkey.ts" maxLines={22} />
      </section>
      <section aria-labelledby="dm-how">
        <h2 id="dm-how">How the mixer drives it</h2>
        <p>Each control updates React state. The page rebuilds a typed pattern from that state and, while it plays,
          hands it to <code>update()</code> — the music keeps its place instead of restarting.</p>
        <CodeBlock source={'const pattern = useMemo(() => buildMix(DANCE_MONKEY, mix), [mix])'} pattern={pattern} label="This page" />
      </section>
      <Pager previous={{ label: 'Kick', path: ROUTES.cookbook }} />
    </DocsLayout>
  )
}
