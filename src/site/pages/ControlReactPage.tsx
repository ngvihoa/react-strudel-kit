import source from '../../content/examples/ReactMixer.tsx?raw'
import { ReactMixer } from '../../content/examples/ReactMixer'
import { stripRegions } from '../../content/source'
import { Callout, CodeBlock } from '../components'
import { LessonArticle } from '../LessonArticle'
import { ROUTES, href } from '../router'

export function ControlReactPage() {
  return <LessonArticle path={ROUTES.controlReact} title="Control it with React" lesson={5}
    intro="Turn the four musical parts into an interactive component. React owns the controls; Strudel owns playback."
    learn={[<>Build a pattern from React state</>, <>Start audio with a gesture and update it while playing</>, <>Stop playback and handle errors</>]}
    steps={[
      { id: 'try-it', title: 'Play the component', body: <>
        <p>This is the actual component shown below, playing the same four parts from <a href={href(ROUTES.layerParts)}>Layer the parts</a>.
          Press Play, change the tempo, and untick a part. These checkboxes include or exclude entire parts.</p>
        <p>Try changing controls after Stop too: the controls change, but audio waits for another Play.</p>
        <div className="react-mixer-frame"><ReactMixer /></div>
      </> },
      { id: 'state', title: 'Keep the controls as plain state', source, region: 'state', body: <>
        <p>The state has a BPM value and a muted flag for each part. It stores the user’s choices, not an audio engine.
          The imported <a href={href(ROUTES.layerASong)}><code>LAYERS</code></a> map contains the reusable drum, bass, chord and melody patterns.</p>
      </> },
      { id: 'build', title: 'Turn state into a pattern', source, region: 'build', body: <>
        <p>The builder filters muted parts and stacks the remaining patterns. If everything is muted, it returns{' '}
          <code>silence</code>. It applies the chosen BPM as <code>cpm</code>, with four beats per bar.</p>
        <p>This function is independent of React rendering and starts no audio. You can call it from other components too.</p>
      </> },
      { id: 'lifecycle', title: 'Choose play, update or stop', source, region: 'component', body: <>
        <p>Import <code>useStrudel</code> from <code>react-strudel-kit/react</code>. Call <code>play</code> from a click
          or keyboard gesture; that lets the browser enable audio and loads the runtime on first use.</p>
        <p>The change handler stores the next state. Only when status is <code>playing</code> does it call{' '}
          <code>update</code>, replacing the running pattern without restarting its scheduler. Stop cancels pending Play too.</p>
        <Callout title="One shared transport">
          Multiple hooks observe the same transport. Starting another player replaces this one. Leaving a page stops its
          music in this learning site; in your own app, use Stop for route cleanup if a hook remains mounted across routes.
          Unmounting the last hook consumer also stops playback.
        </Callout>
      </> },
    ]}
    recap={<>
      <ul><li>State describes the controls; a pure function describes the pattern.</li>
        <li>Use <code>play</code> for an explicit start, <code>update</code> for live changes and <code>stop</code> to end playback.</li>
        <li>Display the hook’s error and status so failures are visible.</li></ul>
      <details className="source-details"><summary>Full ReactMixer component</summary>
        <CodeBlock source={stripRegions(source)} label="ReactMixer.tsx" maxLines={28} />
      </details>
      <p>You have built notes, a beat, a bass line, an arrangement and a <a href={href(ROUTES.reactMixer)}>React player</a>.
        Explore the <a href={href(ROUTES.api)}>API reference</a> or try the <a href={href(ROUTES.lofi)}>Lo-fi loop</a> next.</p>
    </>}
    previous={{ label: 'Layer the parts', path: ROUTES.layerParts }} next={{ label: 'Explore the examples', path: ROUTES.simpleMelody }} />
}
