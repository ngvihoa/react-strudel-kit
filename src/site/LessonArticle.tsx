import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PatternExpression } from 'react-strudel-kit'
import { sourceRegion } from '../content/source'
import { CodeBlock, DocsLayout, PageHeader, Pager, ParamSlider, Player, Toc } from './components'
import type { RoutePath } from './router'

export type LessonStep = {
  id: string
  title: string
  body: ReactNode
  source?: string
  region?: string
  pattern?: PatternExpression
  playerTitle?: string
}

type Practice = {
  title: string
  source: string
  region: string
  build: (bpm: number, amount: number) => PatternExpression
  label: string
  unit: string
  initial: number
  min: number
  max: number
  step: number
}

function PracticePlayer({ path, practice }: { path: RoutePath, practice: Practice }) {
  const [bpm, setBpm] = useState(100)
  const [amount, setAmount] = useState(practice.initial)
  const build = practice.build
  const pattern = useMemo(() => build(bpm, amount), [build, bpm, amount])
  return <>
    <p>Change the controls, then press Play. While playing, changes apply live; while stopped, they wait for your next Play.
      The Strudel output tab shows your current values.</p>
    <Player id={`${path}-practice`} title={practice.title} pattern={pattern}>
      <ParamSlider label="Tempo" unit="BPM" value={bpm} min={70} max={140} step={1} onChange={setBpm} />
      <ParamSlider label={practice.label} unit={practice.unit} value={amount} min={practice.min} max={practice.max} step={practice.step} onChange={setAmount} />
      <button className="reset-button" type="button" onClick={() => { setBpm(100); setAmount(practice.initial) }}>Reset controls</button>
    </Player>
    <CodeBlock source={sourceRegion(practice.source, practice.region)} pattern={pattern} />
  </>
}

export function LessonArticle({ path, title, intro, lesson, learn, steps, practice, recap, previous, next }: {
  path: RoutePath
  title: string
  intro: string
  lesson: number
  learn: readonly ReactNode[]
  steps: readonly LessonStep[]
  practice?: Practice
  recap: ReactNode
  previous: { label: string, path: RoutePath }
  next: { label: string, path?: RoutePath }
}) {
  const toc = [...steps.map(({ id, title: label }) => ({ id, label })),
    ...(practice ? [{ id: 'make-it-yours', label: 'Make it yours' }] : []), { id: 'recap', label: 'Recap' }]
  return <DocsLayout variant="lesson"
    header={<PageHeader crumbs={['Learn', `Lesson ${lesson}`]} title={title} intro={intro} meta={[`Lesson ${lesson}`, '100 BPM']} learn={learn} />}
    asideLabel="On this page" aside={<Toc items={toc} />}>
    {steps.map((step, index) => <section className="lesson-step" id={step.id} key={step.id} aria-labelledby={`${step.id}-title`}>
      <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <h2 id={`${step.id}-title`}>{step.title}</h2>
      {step.body}
      {step.source && step.region && <CodeBlock source={sourceRegion(step.source, step.region)} pattern={step.pattern} />}
      {step.pattern && <Player id={`${path}-${step.id}`} title={step.playerTitle ?? step.title} pattern={step.pattern} compact />}
    </section>)}
    {practice && <section className="lesson-step" id="make-it-yours" aria-labelledby="make-it-yours-title">
      <span className="step-number" aria-hidden="true">{String(steps.length + 1).padStart(2, '0')}</span>
      <h2 id="make-it-yours-title">Make it yours</h2>
      <PracticePlayer path={path} practice={practice} />
    </section>}
    <section id="recap" aria-labelledby="recap-title"><h2 id="recap-title">Recap</h2>{recap}</section>
    <Pager previous={previous} next={next} />
  </DocsLayout>
}
