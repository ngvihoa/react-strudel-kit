import source from '../../content/firstSong.ts?raw'
import { FIRST_SONG_STEPS } from '../../content/firstSong'
import { sourceRegion } from '../../content/source'
import { Callout, CodeBlock, DocsLayout, PageHeader, Pager, Player, SectionNav, Toc } from '../components'
import { LEARN_NAV } from '../navigation'
import { ROUTES } from '../router'

const STEPS = [
  { id: 'one-note', title: 'Play one note', pattern: FIRST_SONG_STEPS.oneNote, body: <>
    <p><code>pitch('c4')</code> is the note C in the fourth octave — middle C. <code>fn('note', …)</code> turns it into
      a pattern that plays once per cycle, and <code>instrument</code> picks the built-in triangle synth.</p>
    <p><code>gain</code> is loudness from 0 upward. Keep it around 0.3 while you experiment.</p>
  </> },
  { id: 'four-notes', title: 'Play four notes in a row', pattern: FIRST_SONG_STEPS.fourNotes, body: <>
    <p><code>sequence(…)</code> splits one cycle into equal shares, one per entry. Four notes means each takes a quarter of the bar.</p>
  </> },
  { id: 'long-and-rest', title: 'Hold a note, then rest', pattern: FIRST_SONG_STEPS.longAndRest, body: <>
    <p><code>weight(…, 2)</code> gives a note two shares instead of one. <code>rest()</code> takes a share and stays silent.
      The bar now has four shares: C takes half, E a quarter, silence a quarter.</p>
  </> },
] as const

const TOC = STEPS.map((step) => ({ id: step.id, label: step.title }))

export function LessonPage() {
  return (
    <DocsLayout variant="lesson"
      nav={<SectionNav groups={LEARN_NAV} current={ROUTES.lesson} label="Lessons" />}
      header={<PageHeader crumbs={['Learn', 'Getting started']} title="Your first song"
        intro="Play a note, line up a few more, and shape their rhythm. Every example on this page is the code that plays."
        meta={['Lesson 1', '5 minutes']}
        learn={[<>Play a single note with <code>pitch</code></>, <>Put notes in a row with <code>sequence</code></>, <>Make notes longer with <code>weight</code> and add silence with <code>rest</code></>]} />}
      asideLabel="On this page"
      aside={<Toc items={TOC} />}>
      <Callout kind="caution" title="Before you press Play">
        Turn your device volume down. Audio starts only when you press a Play button.
      </Callout>
      {STEPS.map((step, index) => (
        <section className="lesson-step" id={step.id} key={step.id} aria-labelledby={`${step.id}-title`}>
          <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <h2 id={`${step.id}-title`}>{step.title}</h2>
          {step.body}
          <CodeBlock source={sourceRegion(source, step.id)} pattern={step.pattern} />
          <Player id={`lesson-${step.id}`} title={step.title} pattern={step.pattern} compact />
        </section>
      ))}
      <Callout kind="tip" title="Try it">
        Swap <code>'triangle'</code> for <code>'square'</code> or <code>'sawtooth'</code> in the Playground's code editor and hear how the tone changes.
      </Callout>
      <Pager next={{ label: 'Make a beat' }} />
    </DocsLayout>
  )
}
