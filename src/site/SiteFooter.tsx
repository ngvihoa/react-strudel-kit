import logo from '../assets/rsk-logo.png'
import { href, ROUTES } from './router'

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><a href={href(ROUTES.home)}><img src={logo} alt="" width={86} height={28} /><span>react-strudel-kit</span></a><p>Music is a pattern.<br />Make it your own.</p></div>
      <nav aria-label="Documentation links"><h2>Explore</h2><a href={href(ROUTES.firstSong)}>Get started</a><a href={href(ROUTES.docs)}>Documentation</a><a href={href(ROUTES.api)}>API reference</a><a href={href(ROUTES.playground)}>Playground</a></nav>
      <nav aria-label="Project links"><h2>Project</h2><a href="https://github.com/ngvihoa/react-strudel-kit">GitHub</a><a href="https://www.npmjs.com/package/react-strudel-kit">npm package</a><a href="https://github.com/ngvihoa/react-strudel-kit/issues">Feedback & issues</a><a href="https://strudel.cc">Strudel</a></nav>
    </div>
    <div className="footer-bottom"><p>Built on <a href="https://strudel.cc">Strudel</a>. Made for React.</p><a href="https://github.com/ngvihoa/react-strudel-kit/blob/main/LICENSE">AGPL-3.0-or-later</a></div>
  </footer>
}
