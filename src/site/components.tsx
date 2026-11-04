import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toStrudelCode } from 'react-strudel-kit'
import type { PatternExpression } from 'react-strudel-kit'
import { usePlayer } from './playback'
import { href } from './router'
import type { RoutePath } from './router'

const STATE_LABELS = { ready: 'Ready', starting: 'Starting audio…', playing: 'Playing', error: 'Needs attention' } as const

type PlayerProps = {
  id: string
  title: string
  pattern: PatternExpression
  caption?: ReactNode
  compact?: boolean
  headingLevel?: 2 | 3
  children?: ReactNode
}

/** Play/Stop, status and errors for one lesson pattern; controls go in children. */
export function Player({ id, title, pattern, caption, compact, headingLevel = 3, children }: PlayerProps) {
  const { state, error, start, stop } = usePlayer(id, title, pattern)
  const errorId = useId()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <section className={`player${compact ? ' player-compact' : ''} player-${state}`} aria-label={`${title} player`}>
      <div className="player-head">
        <div className="player-title">
          <Heading>{title}</Heading>
          {caption && <p>{caption}</p>}
        </div>
        <span className="player-state" role="status"><span className="status-dot" aria-hidden="true" />{STATE_LABELS[state]}</span>
      </div>
      <div className="player-buttons">
        <button className="play-button" type="button" onClick={() => void start()} aria-busy={state === 'starting'}
          aria-label={`Play ${title}`} aria-describedby={error ? errorId : undefined}>
          <span className="play-icon" aria-hidden="true">▶</span>{state === 'starting' ? 'Starting…' : 'Play'}
        </button>
        <button className="stop-button" type="button" onClick={stop} aria-label={`Stop ${title}`}>Stop</button>
      </div>
      {children && <div className="player-controls">{children}</div>}
      {error && <p className="error-box" id={errorId} role="alert">{error.message}</p>}
    </section>
  )
}

type SliderProps = {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  hint?: [string, string]
  onChange: (value: number) => void
}

export function ParamSlider({ label, unit, value, min, max, step, hint, onChange }: SliderProps) {
  const id = useId()
  return (
    <div className="range-control param">
      <label htmlFor={id}>{label} <output htmlFor={id}>{value} <span>{unit}</span></output></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={`${value} ${unit}`}
        onChange={(event) => onChange(Number(event.target.value))} />
      {hint && <div className="range-limits"><span>{hint[0]}</span><span>{hint[1]}</span></div>}
    </div>
  )
}

type SelectProps<T extends string> = {
  label: string
  value: T
  options: readonly { value: T, label: string }[]
  onChange: (value: T) => void
}

export function ParamSelect<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  const id = useId()
  return (
    <div className="param-select">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  )
}

type CodeProps = {
  source: string
  /** When given, a second tab shows the Strudel code this pattern serializes to. */
  pattern?: PatternExpression
  label?: string
  maxLines?: number
}

/** Kit source and, optionally, the Strudel code it produces, from the same running values. */
export function CodeBlock({ source, pattern, label = 'react-strudel-kit', maxLines }: CodeProps) {
  const [tab, setTab] = useState<'kit' | 'strudel'>('kit')
  const [copied, setCopied] = useState(false)
  const shown = tab === 'kit' || !pattern ? source : toStrudelCode(pattern)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shown)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { /* Clipboard is optional; the code stays selectable. */ }
  }
  return (
    <figure className="code-block">
      <figcaption className="code-toolbar">
        {pattern ? <div className="code-tabs" role="group" aria-label="Code view">
          <button type="button" aria-pressed={tab === 'kit'} onClick={() => setTab('kit')}>{label}</button>
          <button type="button" aria-pressed={tab === 'strudel'} onClick={() => setTab('strudel')}>Strudel output</button>
        </div> : <span>{label}</span>}
        <button className="code-copy" type="button" onClick={() => void copy()} aria-label={copied ? 'Copied' : 'Copy code'}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.4" d={copied ? 'M3 8.5 6.5 12 13 4.5' : 'M5.5 5.5h7v7h-7zM3.5 10.5h-1v-8h8v1'} /></svg>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </figcaption>
      <pre style={maxLines ? { maxHeight: `${maxLines * 1.7 + 3}em` } : undefined} tabIndex={0}><code>{shown}</code></pre>
    </figure>
  )
}

export function Callout({ kind = 'note', title, children }: { kind?: 'note' | 'tip' | 'caution', title: string, children: ReactNode }) {
  return (
    <aside className={`callout callout-${kind}`}>
      <p className="callout-title">{title}</p>
      <div>{children}</div>
    </aside>
  )
}

export type NavGroup = { title: string, items: readonly { label: string, path?: RoutePath, meta?: string }[] }

/** Section navigation. Planned pages are listed without links so nothing unbuilt looks available. */
export function SectionNav({ groups, current, label }: { groups: readonly NavGroup[], current: RoutePath, label: string }) {
  const disclosure = useRef<HTMLDetailsElement>(null)
  const wideNav = useRef<HTMLDivElement>(null)
  useEffect(() => {
    disclosure.current?.removeAttribute('open')
    const wide = wideNav.current
    const active = wide?.querySelector<HTMLElement>('[aria-current="page"]')
    const sidebar = wide?.closest<HTMLElement>('.docs-nav')
    if (!wide?.clientHeight || !active || !sidebar) return
    const item = active.getBoundingClientRect()
    const bounds = sidebar.getBoundingClientRect()
    // Keep direct visits and Pager navigation visible without scrolling the article.
    if (item.top < bounds.top || item.bottom > bounds.bottom) sidebar.scrollTop += item.top - bounds.top - 32
  }, [current])
  const list = groups.map((group) => (
    <div className="section-nav-group" key={group.title}>
      <p>{group.title}</p>
      <ol>
        {group.items.map((item) => <li key={item.label}>
          {item.path ? <a href={href(item.path)} aria-current={item.path === current ? 'page' : undefined}>{item.label}{item.meta && <small>{item.meta}</small>}</a>
            : <span className="nav-planned" title="Planned">{item.label}<small>Soon</small></span>}
        </li>)}
      </ol>
    </div>
  ))
  return (
    <nav className="section-nav" aria-label={label} onClick={(event) => {
      if (event.target instanceof Element && event.target.closest('a')) {
        event.currentTarget.querySelector('details')?.removeAttribute('open')
      }
    }}>
      <div className="section-nav-wide" ref={wideNav}>{list}</div>
      <details className="section-nav-narrow" ref={disclosure}>
        <summary>{label}</summary>
        {list}
      </details>
    </nav>
  )
}

type DocsLayoutProps = {
  header: ReactNode
  aside?: ReactNode
  asideLabel?: string
  toc?: readonly { id: string, label: string }[]
  children: ReactNode
  variant: 'lesson' | 'example' | 'cookbook' | 'reference'
}

/** Article flow and a separate sticky section index; narrow screens stack the index above the article. */
export function DocsLayout({ header, aside, asideLabel, toc, children, variant }: DocsLayoutProps) {
  return (
    <div className={`docs-page docs-${variant}${toc ? ' docs-with-toc' : ''}`}>
      <div className={`docs-main${aside ? ' docs-has-aside' : ''}`}>
        <header className="docs-header">{header}</header>
        {aside && <aside className="docs-aside" aria-label={asideLabel}>{aside}</aside>}
        <div className="docs-body">{children}</div>
      </div>
      {toc && <aside className="docs-quick-access" aria-label="Quick access"><Toc items={toc} /></aside>}
    </div>
  )
}

type PageHeaderProps = {
  crumbs: readonly string[]
  title: string
  intro: ReactNode
  meta?: readonly string[]
  /** "You will learn" list, shown as a box under the intro. */
  learn?: readonly ReactNode[]
}

export function PageHeader({ crumbs, title, intro, meta, learn }: PageHeaderProps) {
  return <>
    <nav aria-label="Breadcrumb"><ol className="crumbs">{crumbs.map((crumb) => <li key={crumb}>{crumb}</li>)}</ol></nav>
    <h1>{title}</h1>
    <p className="lede">{intro}</p>
    {meta && <ul className="page-meta">{meta.map((item) => <li key={item}>{item}</li>)}</ul>}
    {learn && <div className="learn-box">
      <p>You will learn</p>
      <ul>{learn.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </div>}
  </>
}

/** "On this page" with the section in view highlighted. */
export function Toc({ items }: { items: readonly { id: string, label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-80px 0px -60% 0px' })
    items.forEach((item) => { const element = document.getElementById(item.id); if (element) observer.observe(element) })
    return () => observer.disconnect()
  }, [items])
  return (
    <nav className="toc" aria-label="On this page">
      <p>On this page</p>
      <ol>{items.map((item) => <li key={item.id}>
        <a href={`#${item.id}`} aria-current={item.id === active ? 'location' : undefined} onClick={(event) => {
          // Keep reading position changes out of browser history.
          event.preventDefault()
          setActive(item.id)
          document.getElementById(item.id)?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
        }}>{item.label}</a>
      </li>)}</ol>
    </nav>
  )
}

type PagerLink = { label: string, path?: RoutePath }

export function Pager({ previous, next }: { previous?: PagerLink, next?: PagerLink }) {
  const card = (link: PagerLink | undefined, direction: 'Previous' | 'Next') => {
    if (!link) return <span />
    const className = `pager-card pager-${direction.toLowerCase()}`
    return link.path
      ? <a className={className} href={href(link.path)}><small>{direction}</small><span>{link.label}</span></a>
      : <span className={`${className} pager-planned`}><small>{direction} · soon</small><span>{link.label}</span></span>
  }
  return <nav className="pager" aria-label="Previous and next">{card(previous, 'Previous')}{card(next, 'Next')}</nav>
}
