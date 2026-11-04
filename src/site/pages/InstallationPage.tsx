import { GettingStarted } from '../../content/GettingStarted'
import source from '../../content/GettingStarted.tsx?raw'
import { Callout, CodeBlock, DocsLayout, PageHeader, Pager } from '../components'
import { href, ROUTES } from '../router'

const TOC = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'install', label: 'Install the package' },
  { id: 'first-player', label: 'Create a player' },
  { id: 'try-player', label: 'Try it' },
  { id: 'next', label: 'Next steps' },
]

export function InstallationPage() {
  return <DocsLayout variant="reference" toc={TOC} header={<PageHeader crumbs={['Docs', 'Start here']} title="Installation"
    intro="Add React Strudel Kit to an existing React app, connect a Play button and hear your first pattern." />}>
    <section id="requirements"><h2>Requirements</h2>
      <ul>
        <li>React 18 or later, with React DOM already installed in your app.</li>
        <li>An ESM-capable bundler. The package has no CommonJS build.</li>
        <li>A browser with Web Audio for playback.</li>
      </ul>
      <p>TypeScript is optional. Declarations are included and support <code>bundler</code> and <code>NodeNext</code> module resolution.</p>
    </section>
    <section id="install"><h2>Install the package</h2>
      <p>Run this in your React application’s directory:</p>
      <CodeBlock source="npm install react-strudel-kit" label="Terminal" />
      <p>Import composition helpers from <code>react-strudel-kit</code> and the playback hook from <code>react-strudel-kit/react</code>. No provider or sample downloads are needed for this synthesized example.</p>
    </section>
    <section id="first-player"><h2>Create a player</h2>
      <p>Save this component as <code>GettingStarted.tsx</code> and render <code>&lt;GettingStarted /&gt;</code> in your app. The class names are optional hooks for your own button styles.</p>
      <CodeBlock source={source} label="GettingStarted.tsx" />
      <Callout title="Use a client component">The hook needs a browser. In an app with server components, keep this file behind the <code>'use client'</code> boundary shown above. Call <code>play</code> from a click or keyboard gesture so the browser can enable audio.</Callout>
    </section>
    <section id="try-player"><h2>Try it</h2>
      <p>This is the same component as the code above. Press Play to start the pattern and Stop to end it. The Strudel runtime loads on the first Play.</p>
      <div className="installation-demo"><GettingStarted /></div>
      <p>Every <code>useStrudel()</code> call shares one transport. Starting another player replaces the current pattern. When adding live controls, use <code>update</code> while playing; changing controls while stopped should not start playback.</p>
    </section>
    <section id="next"><h2>Next steps</h2>
      <p>Follow <a href={href(ROUTES.firstSong)}>Your first song</a> to understand notes and patterns, or <a href={href(ROUTES.controlReact)}>Control it with React</a> to build live controls. Use the <a href={href(ROUTES.api)}>API reference</a> for the full playback contract and error states.</p>
    </section>
    <Pager previous={{ label: 'Introduction', path: ROUTES.docs }} next={{ label: 'Your first song', path: ROUTES.firstSong }} />
  </DocsLayout>
}
