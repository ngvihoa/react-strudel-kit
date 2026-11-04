import { href, ROUTES } from '../router'

export function NotFoundPage() {
  return <div className="landing"><section className="landing-hero">
    <p>404</p>
    <h1>Page not found</h1>
    <p>This page may have moved. Start with the documentation or return home to find your next musical idea.</p>
    <div className="landing-actions"><a className="landing-action" href={href(ROUTES.docs)}>Open documentation</a><a className="landing-secondary" href={href(ROUTES.home)}>Back home</a></div>
  </section></div>
}
