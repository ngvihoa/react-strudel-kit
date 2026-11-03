import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { useStrudel } from 'react-strudel-kit/react'
import App from '../App'
import logo from '../assets/rsk-logo.png'
import { PlaybackProvider } from './PlaybackProvider'
import { ApiPage } from './pages/ApiPage'
import { BassPage, HiHatPage, KeysPage, KickPage, LeadPage, PadPage, SnarePage } from './pages/cookbook'
import { DanceMonkeyPage } from './pages/DanceMonkeyPage'
import {
  BackbeatPage, BassLinePage, ChordsPage, FourOnTheFloorPage, HiHatAccentsPage, HousePage, LayerASongPage, LofiPage, SimpleMelodyPage,
} from './pages/examples'
import { ReactMixerPage } from './pages/ReactMixerPage'
import { LessonPage } from './pages/LessonPage'
import { MakeBeatPage } from './pages/MakeBeatPage'
import { ROUTES, followSiteLink, href, useRoute } from './router'
import type { RoutePath } from './router'
import './site.css'

// Each header link opens the first page of its section and stays current on every page in it.
const SECTIONS: readonly { label: string, path: RoutePath, prefix: string }[] = [
  { label: 'Learn', path: ROUTES.firstSong, prefix: '/learn/' },
  { label: 'Sound Cookbook', path: ROUTES.kick, prefix: '/cookbook/' },
  { label: 'Examples', path: ROUTES.simpleMelody, prefix: '/examples/' },
  { label: 'API', path: ROUTES.api, prefix: '/api' },
  { label: 'Playground', path: ROUTES.playground, prefix: '/playground' },
]

const PAGES = {
  [ROUTES.firstSong]: LessonPage,
  [ROUTES.makeBeat]: MakeBeatPage,
  [ROUTES.kick]: KickPage,
  [ROUTES.snare]: SnarePage,
  [ROUTES.hiHat]: HiHatPage,
  [ROUTES.bass]: BassPage,
  [ROUTES.keys]: KeysPage,
  [ROUTES.lead]: LeadPage,
  [ROUTES.pad]: PadPage,
  [ROUTES.simpleMelody]: SimpleMelodyPage,
  [ROUTES.fourOnTheFloor]: FourOnTheFloorPage,
  [ROUTES.backbeat]: BackbeatPage,
  [ROUTES.hiHatAccents]: HiHatAccentsPage,
  [ROUTES.bassLine]: BassLinePage,
  [ROUTES.chords]: ChordsPage,
  [ROUTES.layerASong]: LayerASongPage,
  [ROUTES.reactMixer]: ReactMixerPage,
  [ROUTES.lofi]: LofiPage,
  [ROUTES.house]: HousePage,
  [ROUTES.api]: ApiPage,
  [ROUTES.danceMonkey]: DanceMonkeyPage,
  [ROUTES.playground]: App,
} satisfies Record<RoutePath, ComponentType>

/** Slides one underline to the current section instead of jumping between links. */
const useNavIndicator = (route: RoutePath) => {
  const nav = useRef<HTMLElement>(null)
  const [bar, setBar] = useState<{ left: number, width: number } | null>(null)
  useLayoutEffect(() => {
    const element = nav.current
    if (!element) return
    const measure = () => {
      const active = element.querySelector<HTMLElement>('[aria-current="page"]')
      setBar(active ? { left: active.offsetLeft, width: active.offsetWidth } : null)
      // On narrow screens the nav scrolls sideways; keep the current section in view.
      if (active && (active.offsetLeft < element.scrollLeft || active.offsetLeft + active.offsetWidth > element.scrollLeft + element.clientWidth)) {
        element.scrollLeft = active.offsetLeft
      }
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    // Web fonts and narrow layouts change link widths after the first measure.
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [route])
  return { nav, bar }
}

export function Site() {
  const content = useRef<HTMLElement>(null)
  const route = useRoute()
  const { stop } = useStrudel()
  const Page = PAGES[route]
  const { nav, bar } = useNavIndicator(route)

  // Leaving a page always stops its music; the next page waits for its own Play.
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
    return () => stop()
  }, [route, stop])

  return (
    <PlaybackProvider>
      <div className="site" onClick={followSiteLink}>
        <a className="skip-link" href="#content" onClick={(event) => {
          // Move focus without adding a browser-history entry.
          event.preventDefault()
          content.current?.focus({ preventScroll: true })
          window.scrollTo(0, 0)
        }}>Skip to content</a>
        <header className="site-header">
          <a className="brand-logo" href={href(ROUTES.firstSong)}><img src={logo} alt="react-strudel-kit home" width={86} height={28} /></a>
          <nav className="site-nav" aria-label="Sections" ref={nav}>
            {SECTIONS.map((section) => <a key={section.path} href={href(section.path)} aria-label={section.label} aria-current={route.startsWith(section.prefix) ? 'page' : undefined}>{section.label.startsWith('Sound ') ? <><span className="nav-long">Sound </span>{section.label.slice(6)}</> : section.label}</a>)}
            {bar && <span className="site-nav-bar" aria-hidden="true" style={{ transform: `translateX(${bar.left}px)`, width: bar.width }} />}
          </nav>
        </header>
        <main id="content" ref={content} tabIndex={-1} className={route === ROUTES.playground ? 'site-main site-main-playground' : 'site-main'}>
          <Page key={route} />
        </main>
        <footer className="site-footer"><span>Made to be played with.</span><span>Audio stays in your browser.</span></footer>
      </div>
    </PlaybackProvider>
  )
}
