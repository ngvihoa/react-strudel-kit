import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import source from '../../content/firstSong.ts?raw'
import { FIRST_SONG_STEPS, TUNE_DEFAULTS, myTune } from '../../content/firstSong'
import type { TuneSettings, TuneSlot } from '../../content/firstSong'
import { sourceRegion } from '../../content/source'
import { WAVEFORMS } from '../../mixer'
import { Callout, CodeBlock, DocsLayout, PageHeader, Pager, ParamSelect, ParamSlider, Player } from '../components'
import { ROUTES, href } from '../router'

const code = (region: string) => sourceRegion(source, region)

type Step = { id: string, title: string, body: ReactNode }

const STEPS: readonly Step[] = [
  { id: 'one-note', title: 'Play one note', body: <>
    <p>A song is built from patterns, and the smallest pattern is a single note. Start with middle C:</p>
    <CodeBlock source={code('one-note')} pattern={FIRST_SONG_STEPS.oneNote} />
    <Player id="lesson-one-note" title="One note" pattern={FIRST_SONG_STEPS.oneNote} compact />
    <p>Read it from the inside out:</p>
    <ul>
      <li><code>pitch('c4')</code> names the note C in the fourth octave. Lower numbers are lower octaves.</li>
      <li><code>fn('note', …)</code> turns that name into a pattern Strudel can play. It plays once per cycle — one bar, for now.</li>
      <li><code>chain(…)</code> adds settings to the pattern: <code>instrument</code> picks a built-in synth,
        and <code>gain</code> sets loudness, from 0 (silent) upward.</li>
    </ul>
    <p><code>fn</code> is checked by TypeScript as you type, so a misspelled function name shows up in your editor instead of as silence.</p>
  </> },
  { id: 'four-notes', title: 'Put notes in a row', body: <>
    <p><code>sequence(…)</code> plays its entries one after another and splits the bar equally between them.
      Four notes means each gets a quarter of the bar.</p>
    <CodeBlock source={code('four-notes')} pattern={FIRST_SONG_STEPS.fourNotes} />
    <Player id="lesson-four-notes" title="Four notes" pattern={FIRST_SONG_STEPS.fourNotes} compact />
    <p>Add a fifth note and every note gets shorter, because the bar stays the same length.
      A sequence divides time; it does not add time.</p>
  </> },
  { id: 'long-and-rest', title: 'Hold a note, then rest', body: <>
    <p>Equal shares make every note the same length. <code>weight(…, 2)</code> gives one entry two shares instead
      of one, and <code>rest()</code> takes a share and stays silent.</p>
    <CodeBlock source={code('long-and-rest')} pattern={FIRST_SONG_STEPS.longAndRest} />
    <Player id="lesson-long-and-rest" title="Long note and rest" pattern={FIRST_SONG_STEPS.longAndRest} compact />
    <p>Count the shares: 2 + 1 + 1 = 4. C lasts half the bar, E a quarter, and the last quarter is silence.
      Weights are relative, not seconds: <code>weight(…, 2)</code> means “twice as long as a share”, whatever a share happens to be.</p>
    <Callout kind="note" title="weight() is not repeat()">
      Both examples below give C the first half of the bar. <code>weight</code> plays one long C;
      <code>repeat</code> fits two strikes into the same space. Listen for the difference.
    </Callout>
    <div className="compare">
      <div>
        <CodeBlock source={code('held')} pattern={FIRST_SONG_STEPS.held} label="weight" />
        <Player id="lesson-held" title="One held C" pattern={FIRST_SONG_STEPS.held} compact />
      </div>
      <div>
        <CodeBlock source={code('repeated')} pattern={FIRST_SONG_STEPS.repeated} label="repeat" />
        <Player id="lesson-repeated" title="Two quick Cs" pattern={FIRST_SONG_STEPS.repeated} compact />
      </div>
    </div>
  </> },
  { id: 'tempo', title: 'Set the tempo', body: <>
    <p>Every example so far has played at the same speed: one bar every two seconds. That comes from <code>cpm</code>,
      cycles per minute. On this page one cycle is one bar.</p>
    <CodeBlock source={code('tempo')} pattern={FIRST_SONG_STEPS.withTempo} />
    <p>Musicians count beats per minute (BPM) instead. With four beats in a bar, divide BPM by 4 to get <code>cpm</code>:
      120 BPM is 30 cpm. Raise <code>cpm</code> and the whole pattern speeds up; the shares stay in proportion.</p>
  </> },
]

const NOTE_OPTIONS = (['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'rest'] as const)
  .map((value) => ({ value, label: value === 'rest' ? 'Rest' : value.toUpperCase() }))
const SOUND_OPTIONS = WAVEFORMS.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))

const TOC = [...STEPS.map((step) => ({ id: step.id, label: step.title })), { id: 'make-it-yours', label: 'Make it yours' }, { id: 'recap', label: 'Recap' }]

function MakeItYours() {
  const [settings, setSettings] = useState<TuneSettings>(TUNE_DEFAULTS)
  const pattern = useMemo(() => myTune(settings), [settings])
  const setSlot = (index: number, slot: TuneSlot) => setSettings((current) => ({
    ...current, slots: current.slots.map((entry, position) => position === index ? slot : entry),
  }))
  return <>
    <p>Here everything you just learned is one function. Pick four notes or rests, a sound and a tempo.
      Changes apply while it plays; open <b>Strudel output</b> to see the values that are playing now.</p>
    <Player id="lesson-make-it-yours" title="Your tune" pattern={pattern} caption="Four slots, one bar, looping.">
      <div className="slot-grid">
        {settings.slots.map((slot, index) => <ParamSelect key={index} label={`Slot ${index + 1}`} value={slot}
          options={NOTE_OPTIONS} onChange={(value) => setSlot(index, value)} />)}
      </div>
      <ParamSelect label="Sound" value={settings.sound} options={SOUND_OPTIONS}
        onChange={(sound) => setSettings((current) => ({ ...current, sound }))} />
      <ParamSlider label="Tempo" unit="BPM" value={settings.bpm} min={60} max={180} step={1} hint={['Slower', 'Faster']}
        onChange={(bpm) => setSettings((current) => ({ ...current, bpm }))} />
      <button className="reset-button" type="button" onClick={() => setSettings(TUNE_DEFAULTS)}>Reset tune</button>
    </Player>
    <CodeBlock source={code('my-tune')} pattern={pattern} />
  </>
}

export function LessonPage() {
  return (
    <DocsLayout variant="lesson"
      header={<PageHeader crumbs={['Learn', 'Getting started']} title="Your first song"
        intro="Play a note, line up a few more, shape their rhythm and set the tempo. Every example on this page is the code that plays."
        meta={['Lesson 1', '10 minutes']}
        learn={[<>Play a note with <code>pitch</code> and <code>fn('note', …)</code></>, <>Put notes in a row with <code>sequence</code></>,
          <>Shape rhythm with <code>weight</code> and <code>rest</code>, and how that differs from <code>repeat</code></>, <>Set the speed with <code>cpm</code></>]} />}
      asideLabel="On this page"
      toc={TOC}>
      <Callout kind="caution" title="Before you press Play">
        Turn your device volume down. Sound starts only when you press a Play button, and only one example plays at a time.
      </Callout>
      {STEPS.map((step, index) => (
        <section className="lesson-step" id={step.id} key={step.id} aria-labelledby={`${step.id}-title`}>
          <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <h2 id={`${step.id}-title`}>{step.title}</h2>
          {step.body}
        </section>
      ))}
      <section className="lesson-step" id="make-it-yours" aria-labelledby="make-it-yours-title">
        <span className="step-number" aria-hidden="true">{String(STEPS.length + 1).padStart(2, '0')}</span>
        <h2 id="make-it-yours-title">Make it yours</h2>
        <MakeItYours />
      </section>
      <section id="recap" aria-labelledby="recap-title">
        <h2 id="recap-title">Recap</h2>
        <ul>
          <li>A cycle is the unit of time. Here, one cycle is one bar.</li>
          <li><code>sequence</code> splits a cycle into equal shares; <code>weight</code> changes how many shares an entry gets.</li>
          <li><code>rest</code> is a silent share. <code>repeat</code> fits more strikes into one share.</li>
          <li><code>cpm</code> sets how many cycles play per minute: BPM ÷ 4 for four beats per bar.</li>
        </ul>
        <p>Practise with <a href={href(ROUTES.simpleMelody)}>A simple melody</a>, which adds <code>cat</code> to play several bars in a row.
          When you’re ready for drums, start with the <a href={href(ROUTES.kick)}>Kick</a> in the Sound Cookbook and
          the <a href={href(ROUTES.fourOnTheFloor)}>Four on the floor</a> example. <a href={href(ROUTES.danceMonkey)}>Dance Monkey</a> puts all of it together.</p>
      </section>
      <Pager previous={{ label: 'Installation', path: ROUTES.installation }} next={{ label: 'Make a beat', path: ROUTES.makeBeat }} />
    </DocsLayout>
  )
}
