import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PatternExpression } from 'react-strudel-kit'
import { sourceRegion } from '../content/source'
import { Callout, CodeBlock, DocsLayout, PageHeader, Pager, ParamSlider, Player, Toc } from './components'
import { href } from './router'
import type { RoutePath } from './router'

type Link = { label: string, path: RoutePath }

function Facts({ toc, groups }: { toc: readonly { id: string, label: string }[], groups: readonly { title: string, items: readonly ReactNode[] }[] }) {
  return (
    <div className="facts">
      <Toc items={toc} />
      {groups.filter((group) => group.items.length > 0).map((group) => (
        <div key={group.title}><p>{group.title}</p><ul>{group.items.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
      ))}
    </div>
  )
}

const linkList = (links: readonly Link[] = []) => links.map((link) => <a href={href(link.path)}>{link.label}</a>)

type Control<S> = { key: keyof S & string, label: string, unit: string, min: number, max: number, step: number, hint: [string, string] }

export type SoundArticleConfig<S extends Record<string, number>> = {
  path: RoutePath
  crumbs: readonly string[]
  title: string
  intro: ReactNode
  meta: readonly string[]
  source: string
  defaults: S
  controls: readonly Control<S>[]
  alone: { title: string, caption: string, build: (settings: S) => PatternExpression, region: string }
  sound: { region: string, body: ReactNode }
  anatomy: readonly { part: string, unit: string, role: ReactNode }[]
  callout?: { title: string, body: ReactNode }
  groove: { title: string, body: ReactNode, build: (settings: S) => PatternExpression, region: string }
  usedIn?: readonly Link[]
  previous?: Link
  next?: { label: string, path?: RoutePath }
}

/** Sound Cookbook page: hear one sound, tweak it, read its parts, then hear it in a groove. */
export function SoundArticle<S extends Record<string, number>>({ config }: { config: SoundArticleConfig<S> }) {
  const [settings, setSettings] = useState<S>(config.defaults)
  const alone = useMemo(() => config.alone.build(settings), [config, settings])
  const groove = useMemo(() => config.groove.build(settings), [config, settings])
  const code = (region: string) => sourceRegion(config.source, region)

  return (
    <DocsLayout variant="cookbook"
      header={<PageHeader crumbs={config.crumbs} title={config.title} intro={config.intro} meta={config.meta} />}
      asideLabel="Listen"
      aside={<Player id={`${config.path}-alone`} title={config.alone.title} pattern={alone} caption={config.alone.caption} headingLevel={2}>
        {config.controls.map((control) => <ParamSlider key={control.key} label={control.label} unit={control.unit}
          value={settings[control.key]} min={control.min} max={control.max} step={control.step} hint={control.hint}
          onChange={(value) => setSettings((current) => ({ ...current, [control.key]: value }))} />)}
        <button className="reset-button" type="button" onClick={() => setSettings(config.defaults)}>Reset sound</button>
      </Player>}>
      <section id="sound" aria-labelledby="sound-title">
        <h2 id="sound-title">The sound</h2>
        {config.sound.body}
        <CodeBlock source={code(config.sound.region)} />
        <p>Playing it on its own takes a rhythm, here written next to the sound. Switch to <b>Strudel output</b> to see the values the sliders are playing now.</p>
        <CodeBlock source={code(config.alone.region)} pattern={alone} />
      </section>
      <section id="anatomy" aria-labelledby="anatomy-title">
        <h2 id="anatomy-title">How it is built</h2>
        <div className="table-wrap" tabIndex={0}>
          <table className="anatomy">
            <thead><tr><th scope="col">Part</th><th scope="col">Unit</th><th scope="col">What it does</th></tr></thead>
            <tbody>{config.anatomy.map((row) => <tr key={row.part}><th scope="row"><code>{row.part}</code></th><td>{row.unit}</td><td>{row.role}</td></tr>)}</tbody>
          </table>
        </div>
        {config.callout && <Callout title={config.callout.title}>{config.callout.body}</Callout>}
      </section>
      <section id="groove" aria-labelledby="groove-title">
        <h2 id="groove-title">In a groove</h2>
        {config.groove.body}
        <CodeBlock source={code(config.groove.region)} pattern={groove} />
        <Player id={`${config.path}-groove`} title={config.groove.title} pattern={groove} compact />
        {config.usedIn && <p className="used-in">Used in: {linkList(config.usedIn).map((link, index) => <span key={index}>{index > 0 && ' · '}{link}</span>)}</p>}
      </section>
      <Pager previous={config.previous} next={config.next} />
    </DocsLayout>
  )
}

export type ExampleSection = {
  id: string
  title: string
  body: ReactNode
  region: string
  player: { title: string, pattern: PatternExpression }
  after?: ReactNode
}

export type ExampleArticleConfig = {
  path: RoutePath
  crumbs: readonly string[]
  title: string
  intro: ReactNode
  meta: readonly string[]
  source: string
  goal: ReactNode
  techniques: readonly ReactNode[]
  learnFirst?: readonly Link[]
  sounds?: readonly Link[]
  sections: readonly ExampleSection[]
  previous?: Link
  next?: { label: string, path?: RoutePath }
}

/** Small example page: one learning goal, built up in sections, each with its code and player. */
export function ExampleArticle({ config }: { config: ExampleArticleConfig }) {
  const toc = config.sections.map((section) => ({ id: section.id, label: section.title }))
  return (
    <DocsLayout variant="example"
      header={<PageHeader crumbs={config.crumbs} title={config.title} intro={config.intro} meta={config.meta}
        learn={[config.goal]} />}
      asideLabel="About this example"
      aside={<Facts toc={toc} groups={[
        { title: 'Techniques', items: config.techniques },
        { title: 'Learn first', items: linkList(config.learnFirst) },
        { title: 'Sounds used', items: linkList(config.sounds) },
      ]} />}>
      {config.sections.map((section) => (
        <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{section.title}</h2>
          {section.body}
          <CodeBlock source={sourceRegion(config.source, section.region)} pattern={section.player.pattern} />
          <Player id={`${config.path}-${section.id}`} title={section.player.title} pattern={section.player.pattern} compact />
          {section.after}
        </section>
      ))}
      <Pager previous={config.previous} next={config.next} />
    </DocsLayout>
  )
}
