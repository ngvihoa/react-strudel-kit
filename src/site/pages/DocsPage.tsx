import { DocsLayout, PageHeader, Pager } from '../components'
import { href, ROUTES } from '../router'

const PATHS = [
  { path: ROUTES.firstSong, title: 'Learn by playing', body: 'Start with a note. Add rhythm, bass and layers, then connect your music to React controls.' },
  { path: ROUTES.kick, title: 'Shape a sound', body: 'Explore kicks, snares, hi-hats, bass, keys, leads and pads. Hear what each parameter changes.' },
  { path: ROUTES.lofi, title: 'Take a pattern apart', body: 'Follow complete examples, from a simple melody to lo-fi, house and an interactive React mixer.' },
  { path: ROUTES.api, title: 'Find a function', body: 'Look up typed helpers and playback behavior, with links to the examples that use them.' },
] as const

const TOC = [
  { id: 'overview', label: 'What is React Strudel Kit?' },
  { id: 'included', label: 'What you get' },
  { id: 'explore', label: 'Explore the docs' },
  { id: 'start', label: 'Get started' },
]

export function DocsPage() {
  return <DocsLayout variant="reference" toc={TOC} header={<PageHeader crumbs={['Docs', 'Start here']} title="Introduction"
    intro="Write music in TypeScript and play it with your own React interface. Start here to understand the toolkit, then install it or explore a sound." />}>
    <section id="overview"><h2>What is React Strudel Kit?</h2>
      <p><code>react-strudel-kit</code> is a typed layer for <a href="https://strudel.cc">Strudel</a>, a system for making music with code. Strudel supplies the pattern engine and audio scheduler; the kit adds typed composition and React playback integration.</p>
      <p>Use it to build musical experiments, interactive lessons or an instrument with your own controls. The website is a reference app you can listen to and learn from.</p>
    </section>
    <section id="included"><h2>What you get</h2>
      <ul>
        <li><strong>Typed composition:</strong> build patterns with <code>fn</code>, <code>chain</code> and Mini-Notation helpers, with checks for supported function names and arguments.</li>
        <li><strong>React playback:</strong> connect <code>useStrudel</code> to your controls with <code>play</code>, <code>update</code> and <code>stop</code>. No provider is required.</li>
        <li><strong>Inspectable output:</strong> serialize typed patterns to Strudel code and follow the source behind the examples.</li>
      </ul>
      <p>The types cover the kit’s supported API subset. They do not check musical values, sample availability or raw JavaScript. Built-in synths work immediately; sample banks are not loaded for you.</p>
      <p>The kit is open source under <a href="https://github.com/ngvihoa/react-strudel-kit/blob/main/LICENSE">AGPL-3.0-or-later</a>. Strudel retains its own license and notices.</p>
    </section>
    <section id="explore"><h2>Explore the docs</h2>
      <div className="docs-starts">{PATHS.map((item) => <section key={item.path}>
        <h3><a href={href(item.path)}>{item.title} <span aria-hidden="true">↗</span></a></h3><p>{item.body}</p>
      </section>)}</div>
    </section>
    <section id="start"><h2>Get started</h2><p>Follow <a href={href(ROUTES.installation)}>Installation</a> to add the package to your React app and play a first pattern.</p>
      <p>Want to experiment first? Open the <a href={href(ROUTES.playground)}>Playground</a>.</p></section>
    <Pager next={{ label: 'Installation', path: ROUTES.installation }} />
  </DocsLayout>
}
