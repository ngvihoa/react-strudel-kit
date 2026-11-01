import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { useStrudel } from 'react-strudel-kit/react'
import App from '../App'
import logo from '../assets/rsk-logo.png'
import { PlaybackProvider } from './PlaybackProvider'
import { CookbookPage } from './pages/CookbookPage'
import { ExamplePage } from './pages/ExamplePage'
import { LessonPage } from './pages/LessonPage'
import { ROUTES, href, useRoute } from './router'
import type { RoutePath } from './router'
import './site.css'

const SECTIONS: readonly { label: string, path: RoutePath }[] = [
  { label: 'Learn', path: ROUTES.lesson },
  { label: 'Sound Cookbook', path: ROUTES.cookbook },
  { label: 'Examples', path: ROUTES.example },
  { label: 'Playground', path: ROUTES.playground },
]

const PAGES = {
  [ROUTES.lesson]: LessonPage,
  [ROUTES.cookbook]: CookbookPage,
  [ROUTES.example]: ExamplePage,
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
  const route = useRoute()
  const { stop } = useStrudel()
  const Page = PAGES[route]
  const { nav, bar } = useNavIndicator(route)

  // Leaving a page always stops its music; the next page waits for its own Play.
  useEffect(() => {
    window.scrollTo(0, 0)
    return () => stop()
  }, [route, stop])

  return (
    <PlaybackProvider>
      <div className="site">
        <a className="skip-link" href="#content">Skip to content</a>
        <header className="site-header">
          <a className="brand-logo" href={href(ROUTES.lesson)}><img src={logo} alt="react-strudel-kit home" width={86} height={28} /></a>
          <nav className="site-nav" aria-label="Sections" ref={nav}>
            {SECTIONS.map((section) => <a key={section.path} href={href(section.path)} aria-current={route === section.path ? 'page' : undefined}>{section.label}</a>)}
            {bar && <span className="site-nav-bar" aria-hidden="true" style={{ transform: `translateX(${bar.left}px)`, width: bar.width }} />}
          </nav>
        </header>
        <main id="content" className={route === ROUTES.playground ? 'site-main site-main-playground' : 'site-main'}>
          <Page key={route} />
        </main>
        <footer className="site-footer"><span>Made to be played with.</span><span>Audio stays in your browser.</span></footer>
      </div>
    </PlaybackProvider>
  )
}
