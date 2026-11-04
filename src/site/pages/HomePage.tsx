import { useMemo, useState } from 'react'
import { chain, fn } from 'react-strudel-kit'
import { lofiLoop } from '../../content/examples/lofi'
import { houseLoop } from '../../content/examples/house'
import lofiSource from '../../content/examples/lofi?raw'
import houseSource from '../../content/examples/house?raw'
import { sourceRegion } from '../../content/source'
import logo from '../../assets/rsk-logo.png'
import { CodeBlock, ParamSlider, Player } from '../components'
import { href, ROUTES } from '../router'
import './home.css'

const SESSIONS = {
  lofi: { name: 'Lo-fi', title: 'Lo-fi session', description: 'Soft keys, a warm bass line and laid-back drums.', pattern: lofiLoop, source: lofiSource, path: ROUTES.lofi },
  house: { name: 'House', title: 'House session', description: 'A driving kick, off-beat bass and bright chord stabs.', pattern: houseLoop, source: houseSource, path: ROUTES.house },
} as const
const PATHS = [
  { title: 'Learn the language', description: 'Start with a note. Build a beat, add a bass line and bring the parts together.', path: ROUTES.firstSong, link: 'Start the lessons' },
  { title: 'Build your palette', description: 'Find out how a kick, a set of keys or a pad is made. Change the sound as you listen.', path: ROUTES.keys, link: 'Open the sound cookbook' },
  { title: 'Connect it to React', description: 'Turn component state into live musical controls with the shared playback hook.', path: ROUTES.reactMixer, link: 'Explore the React mixer' },
] as const

function InstallCommand() {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText('npm install react-strudel-kit')
      setCopied(true)
      setFailed(false)
    } catch {
      setCopied(false)
      setFailed(true)
    }
  }
  return <div className="landing-install">
    <div><span aria-hidden="true">$ </span><code>npm install react-strudel-kit</code></div>
    <button type="button" onClick={() => void copy()} aria-label={copied ? 'Copied install command' : 'Copy install command'}>{copied ? 'Copied' : 'Copy'}</button>
    <span className="install-feedback" role="status">{failed ? 'Select the command to copy it manually.' : copied ? 'Install command copied.' : ''}</span>
  </div>
}

export function HomePage() {
  const [style, setStyle] = useState<keyof typeof SESSIONS>('lofi')
  const [level, setLevel] = useState(0.7)
  const session = SESSIONS[style]
  // Velocity preserves each arrangement's existing mix and master headroom.
  const pattern = useMemo(() => chain(session.pattern, fn('velocity', level)), [session, level])

  return <div className="landing">
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-product"><img src={logo} alt="RSK" width={100} height={32} /><span>react-strudel-kit</span></div>
      <h1 id="landing-title"><span>Make music</span>{' '}<span>with React.</span></h1>
      <p>A typed toolkit for Strudel. Compose patterns in TypeScript, connect your own controls, and hear your React app come alive.</p>
      <InstallCommand />
      <div className="landing-actions"><a className="landing-action" href={href(ROUTES.firstSong)}>Get started <span aria-hidden="true">→</span></a><a className="landing-secondary" href="https://github.com/ngvihoa/react-strudel-kit">View on GitHub <span aria-hidden="true">↗</span></a></div>
    </section>

    <section className="landing-session" aria-labelledby="session-title">
      <header><h2 id="session-title">A little code.<br /> A whole groove.</h2><p>This is the kit playing. Pick a style, press Play and hear how the parts fit together.</p></header>
      <div className="session-workspace" data-ui>
        <div className="session-listen">
          <div className="session-choices" role="group" aria-label="Choose a session">
            {(Object.keys(SESSIONS) as (keyof typeof SESSIONS)[]).map((key) => <button type="button" key={key} aria-pressed={style === key} onClick={() => setStyle(key)}>{SESSIONS[key].name}</button>)}
          </div>
          <div className="session-record" aria-hidden="true"><div><img src={logo} alt="" width={82} height={26} /></div></div>
          <Player id="landing-session" title={session.title} pattern={pattern} caption={session.description} headingLevel={3}>
            <ParamSlider label="Listening level" unit="%" value={Math.round(level * 100)} min={0} max={100} step={1} onChange={(value) => setLevel(value / 100)} />
          </Player>
          <a className="session-source-link" href={href(session.path)}>Explore this arrangement <span aria-hidden="true">↗</span></a>
        </div>
        <div className="session-code">
          <CodeBlock source={sourceRegion(session.source, 'together')} pattern={pattern} label={style === 'lofi' ? 'lofi.ts' : 'house.ts'} />
          <p>Typed patterns in. Music out. Switch to Strudel output to see exactly what is playing, including the listening level.</p>
          <p>The arrangement reuses the sounds in the cookbook. Open it to explore every part.</p>
        </div>
      </div>
    </section>

    <section className="landing-paths" aria-labelledby="paths-title">
      <div className="landing-paths-intro"><h2 id="paths-title">Your next<br /> musical idea.</h2><p>Learn a little, listen a lot. Everything you need is together in Docs.</p><a href={href(ROUTES.docs)}>Explore all documentation <span aria-hidden="true">→</span></a></div>
      <div className="landing-path-list">{PATHS.map((item) => <article key={item.path}><h3>{item.title}</h3><p>{item.description}</p><a href={href(item.path)}>{item.link} <span aria-hidden="true">↗</span></a></article>)}</div>
    </section>

    <section className="landing-questions" aria-labelledby="questions-title">
      <h2 id="questions-title">Before you press Play.</h2>
      <div>
        <details><summary>How does this relate to Strudel?</summary><p><a href="https://strudel.cc">Strudel</a> supplies the pattern engine and audio scheduler. This kit adds typed composition helpers and a React playback hook. It does not replace the engine.</p></details>
        <details><summary>What do I need to use it?</summary><p>React 18 or later, an ESM-capable bundler, and a browser with Web Audio. Use <code>useStrudel</code> in a browser/client component. Audio starts when you press Play.</p></details>
        <details><summary>Can I use my own interface?</summary><p>Yes. Compose typed patterns, then connect <code>play</code>, <code>update</code> and <code>stop</code> to your own components. The <a href={href(ROUTES.api)}>API reference</a> explains the playback contract.</p></details>
        <details><summary>Is it open source?</summary><p>Yes, under AGPL-3.0-or-later. Read the <a href="https://github.com/ngvihoa/react-strudel-kit/blob/main/LICENSE">license</a> and <a href="https://strudel.cc/technical-manual/project-start/">Strudel’s integration guidance</a> for the terms.</p></details>
      </div>
    </section>
  </div>
}
