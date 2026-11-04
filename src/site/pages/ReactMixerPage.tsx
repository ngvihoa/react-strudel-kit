import source from '../../content/examples/ReactMixer.tsx?raw'
import { ReactMixer } from '../../content/examples/ReactMixer'
import { sourceRegion, stripRegions } from '../../content/source'
import { Callout, CodeBlock, DocsLayout, PageHeader, Pager } from '../components'
import { ROUTES, href } from '../router'

const TOC = [
  { id: 'try-it', label: 'Try it' },
  { id: 'build', label: 'State to pattern' },
  { id: 'update', label: 'Play, update, stop' },
  { id: 'source', label: 'Full component' },
]

/** This page runs the user-facing component as written: no site player wraps it. */
export function ReactMixerPage() {
  return (
    <DocsLayout variant="example" toc={TOC}
      header={<PageHeader crumbs={['Examples', 'React']} title="Control it with React"
        intro="A small React component that plays the Layer a song example and lets you change tempo and mute parts while it runs."
        meta={['Intermediate', 'useStrudel', 'play · update · stop']}
        learn={[<>Turn React state into a typed pattern, and swap it in with <code>update()</code> while music plays</>]} />}
      asideLabel="About this example"
      aside={<div className="facts">
        <div><p>Techniques</p><ul><li><code>useStrudel</code></li><li><code>play</code> · <code>update</code> · <code>stop</code></li><li>A pure pattern builder</li></ul></div>
        <div><p>Learn first</p><ul><li><a href={href(ROUTES.layerASong)}>Layer a song</a></li></ul></div>
        <div><p>Reference</p><ul><li><a href={href(ROUTES.api)}>API reference</a></li></ul></div>
      </div>}>
      <section id="try-it" aria-labelledby="try-it-title">
        <h2 id="try-it-title">Try it</h2>
        <p>This is the component below, running as written. Press Play, then untick parts or move the tempo.</p>
        <div className="react-mixer-frame"><ReactMixer /></div>
      </section>
      <section id="build" aria-labelledby="build-title">
        <h2 id="build-title">State to pattern</h2>
        <p>The state is just data: a tempo and which parts are muted. A plain function turns it into a pattern, so it can be tested
          without audio and reused by any component.</p>
        <CodeBlock source={sourceRegion(source, 'state')} label="State" />
        <CodeBlock source={sourceRegion(source, 'build')} label="buildPattern" />
      </section>
      <section id="update" aria-labelledby="update-title">
        <h2 id="update-title">Play, update, stop</h2>
        <p><code>play</code> starts playback and must run from a click or key press, so the browser allows audio. After that, every
          change calls <code>update</code>, which replaces the pattern without restarting the scheduler. While stopped, changes only
          update state: nothing starts until the next Play.</p>
        <CodeBlock source={sourceRegion(source, 'component')} label="ReactMixer" />
        <Callout kind="note" title="One transport for the whole app">
          Every <code>useStrudel()</code> call shares one transport, so a second player elsewhere replaces this one rather than
          playing on top of it. No provider is needed.
        </Callout>
      </section>
      <section id="source" aria-labelledby="source-title">
        <h2 id="source-title">Full component</h2>
        <details className="source-details">
          <summary>Show src/content/examples/ReactMixer.tsx</summary>
          <CodeBlock source={stripRegions(source)} label="ReactMixer.tsx" maxLines={28} />
        </details>
      </section>
      <Pager previous={{ label: 'Layer a song', path: ROUTES.layerASong }} next={{ label: 'Lo-fi loop', path: ROUTES.lofi }} />
    </DocsLayout>
  )
}
