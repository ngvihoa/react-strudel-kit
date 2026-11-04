import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { useStrudel } from 'react-strudel-kit/react'
import App from '../App'
import logo from '../assets/rsk-logo.png'
import { SiteFooter } from './SiteFooter'
import { DOCS_NAV } from './navigation'
import { SectionNav } from './components'
import { PlaybackProvider } from './PlaybackProvider'
import { HomePage } from './pages/HomePage'
import { DocsPage } from './pages/DocsPage'
import { ApiPage } from './pages/ApiPage'
import { BassPage, HiHatPage, KeysPage, KickPage, LeadPage, PadPage, SnarePage } from './pages/cookbook'
import { DanceMonkeyPage } from './pages/DanceMonkeyPage'
import {
  BackbeatPage, BassLinePage, ChordsPage, FourOnTheFloorPage, HiHatAccentsPage, HousePage, LayerASongPage, LofiPage, SimpleMelodyPage,
} from './pages/examples'
import { ReactMixerPage } from './pages/ReactMixerPage'
import { LessonPage } from './pages/LessonPage'
import { MakeBeatPage } from './pages/MakeBeatPage'
import { AddBassPage } from './pages/AddBassPage'
import { LayerPartsPage } from './pages/LayerPartsPage'
import { ControlReactPage } from './pages/ControlReactPage'
import { ROUTES, followSiteLink, href, useRoute } from './router'
import type { RoutePath } from './router'
import './site.css'

const SECTIONS: readonly { label: string, path: RoutePath }[] = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Docs', path: ROUTES.docs },
  { label: 'Playground', path: ROUTES.playground },
]

const PAGES = {
  [ROUTES.home]: HomePage,
  [ROUTES.docs]: DocsPage,
  [ROUTES.firstSong]: LessonPage,
  [ROUTES.makeBeat]: MakeBeatPage,
  [ROUTES.addBass]: AddBassPage,
  [ROUTES.layerParts]: LayerPartsPage,
  [ROUTES.controlReact]: ControlReactPage,
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
      <div className={`site${route === ROUTES.home ? ' site-home' : ''}`} onClick={followSiteLink}>
        <a className="skip-link" href="#content" onClick={(event) => {
          // Move focus without adding a browser-history entry.
          event.preventDefault()
          content.current?.focus({ preventScroll: true })
          window.scrollTo(0, 0)
        }}>Skip to content</a>
        <header className="site-header"><div className="site-header-inner">
          <a className="brand-logo" href={href(ROUTES.home)}><img src={logo} alt="react-strudel-kit home" width={86} height={28} /></a>
          <nav className="site-nav" aria-label="Sections" ref={nav}>
            {SECTIONS.map((section) => <a key={section.path} href={href(section.path)} aria-label={section.label} aria-current={(section.path === ROUTES.docs ? route !== ROUTES.home && route !== ROUTES.playground : route === section.path) ? 'page' : undefined}>{section.label}</a>)}
            {bar && <span className="site-nav-bar" aria-hidden="true" style={{ transform: `translateX(${bar.left}px)`, width: bar.width }} />}
          </nav>
        </div></header>
        <main id="content" ref={content} tabIndex={-1} className={route === ROUTES.playground ? 'site-main site-main-playground' : 'site-main'}>
          {route === ROUTES.home || route === ROUTES.playground ? <Page key={route} /> : <div className="docs">
            <div className="docs-nav"><SectionNav groups={DOCS_NAV} current={route} label="Documentation" /></div>
            <Page key={route} />
          </div>}
        </main>
        <SiteFooter />
      </div>
    </PlaybackProvider>
  )
}
