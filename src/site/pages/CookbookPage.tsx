import { useMemo, useState } from 'react'
import source from '../../content/kick.ts?raw'
import { KICK_DEFAULTS, groove, kick, withTempo } from '../../content/kick'
import type { KickSettings } from '../../content/kick'
import { sourceRegion } from '../../content/source'
import { Callout, CodeBlock, DocsLayout, PageHeader, Pager, ParamSlider, Player, SectionNav } from '../components'
import { COOKBOOK_NAV } from '../navigation'
import { ROUTES } from '../router'

const ANATOMY = [
  { part: 'instrument(sine)', unit: '—', role: 'The source: a pure tone with no overtones, so it reads as a low thump rather than a note.' },
  { part: 'pitchEnvelope', unit: 'semitones', role: 'How far above C2 each strike starts. Larger values give more click and punch.' },
  { part: 'pitchDecay', unit: 'seconds', role: 'How fast the pitch falls back to C2. This is the pitch envelope — it does not change loudness.' },
  { part: 'decay · sustain · release', unit: 'seconds', role: 'The amplitude envelope: how fast loudness fades. Separate from the pitch envelope.' },
] as const

export function CookbookPage() {
  const [settings, setSettings] = useState<KickSettings>(KICK_DEFAULTS)
  const change = (key: keyof KickSettings) => (value: number) => setSettings((current) => ({ ...current, [key]: value }))
  const solo = useMemo(() => withTempo(kick(settings)), [settings])
  const beat = useMemo(() => withTempo(groove(settings)), [settings])

  return (
    <DocsLayout variant="cookbook"
      nav={<SectionNav groups={COOKBOOK_NAV} current={ROUTES.cookbook} label="Sounds" />}
      header={<PageHeader crumbs={['Sound Cookbook', 'Percussion']} title="Kick"
        intro="A kick is a low sine tone that starts high and drops fast. Two envelopes do the work: one moves the pitch, the other fades the volume."
        meta={['Synthesized', 'No samples to download']} />}
      asideLabel="Listen"
      aside={<Player id="cookbook-kick" title="Kick on its own" pattern={solo} caption="Four strikes per bar at 100 BPM. Change the sliders while it plays.">
        <ParamSlider label="Pitch drop" unit="st" value={settings.pitchDrop} min={0} max={48} step={1} hint={['Soft', 'Punchy']} onChange={change('pitchDrop')} />
        <ParamSlider label="Pitch time" unit="s" value={settings.pitchTime} min={0.01} max={0.2} step={0.01} hint={['Click', 'Boom']} onChange={change('pitchTime')} />
        <ParamSlider label="Decay" unit="s" value={settings.decay} min={0.05} max={0.5} step={0.01} hint={['Tight', 'Long']} onChange={change('decay')} />
        <button className="reset-button" type="button" onClick={() => setSettings(KICK_DEFAULTS)}>Reset sound</button>
      </Player>}>
      <section aria-labelledby="kick-code">
        <h2 id="kick-code">The code</h2>
        <p>The sliders feed these three arguments. Switch to <b>Strudel output</b> to see the values that are playing now.</p>
        <CodeBlock source={sourceRegion(source, 'kick')} pattern={solo} />
      </section>
      <section aria-labelledby="kick-anatomy">
        <h2 id="kick-anatomy">How it is built</h2>
        <div className="table-wrap">
          <table className="anatomy">
            <thead><tr><th scope="col">Part</th><th scope="col">Unit</th><th scope="col">What it does</th></tr></thead>
            <tbody>{ANATOMY.map((row) => <tr key={row.part}><th scope="row"><code>{row.part}</code></th><td>{row.unit}</td><td>{row.role}</td></tr>)}</tbody>
          </table>
        </div>
        <Callout title="Two envelopes, two jobs">
          Set <b>Pitch drop</b> to 0 and the kick becomes a plain low note. Set <b>Decay</b> long and it rings like a tom.
          Hearing each one alone is the quickest way to tell them apart.
        </Callout>
      </section>
      <section aria-labelledby="kick-groove">
        <h2 id="kick-groove">In a groove</h2>
        <p>The same kick, with your current settings, under eighth-note hi-hats.</p>
        <CodeBlock source={sourceRegion(source, 'groove')} />
        <Player id="cookbook-kick-groove" title="Kick and hi-hats" pattern={beat} compact />
      </section>
      <Pager next={{ label: 'Snare' }} />
    </DocsLayout>
  )
}
