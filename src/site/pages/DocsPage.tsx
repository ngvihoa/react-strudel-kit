import { DocsLayout, PageHeader } from '../components'
import { href, ROUTES } from '../router'

const PATHS = [
  { path: ROUTES.firstSong, title: 'Learn by playing', body: 'Start with a note. Add rhythm, bass and layers, then connect your music to React controls.' },
  { path: ROUTES.kick, title: 'Shape a sound', body: 'Explore kicks, snares, hi-hats, bass, keys, leads and pads. Hear what each parameter changes.' },
  { path: ROUTES.lofi, title: 'Take a pattern apart', body: 'Follow complete examples, from a simple melody to lo-fi, house and an interactive React mixer.' },
  { path: ROUTES.api, title: 'Find a function', body: 'Look up typed helpers and playback behavior, with links to the examples that use them.' },
] as const

export function DocsPage() {
  return <DocsLayout variant="reference" header={<PageHeader crumbs={['Docs']} title="Make music with code"
    intro="One place to learn the basics, build your sound and find the API you need. Pick a starting point, or explore everything from the sidebar." />}>
    <div className="docs-starts">{PATHS.map((item) => <section key={item.path}>
      <h2><a href={href(item.path)}>{item.title} <span aria-hidden="true">↗</span></a></h2><p>{item.body}</p>
    </section>)}</div>
    <section><h2>Try it in your own app</h2><p>Install <code>react-strudel-kit</code>, then follow <a href={href(ROUTES.controlReact)}>Control it with React</a> to connect a pattern to Play, Stop and live controls. Requires React 18 or later and a browser with Web Audio.</p>
      <p>Want to experiment first? Open the <a href={href(ROUTES.playground)}>Playground</a>.</p></section>
  </DocsLayout>
}
