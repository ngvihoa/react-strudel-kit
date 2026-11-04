import { useMemo, useState } from 'react'
import { toStrudelCode } from 'react-strudel-kit'
import type { Waveform } from '../../mixer'
import { myTune, TUNE_DEFAULTS } from '../../content/firstSong'
import type { TuneSlot } from '../../content/firstSong'
import firstSongSource from '../../content/firstSong?raw'
import { sourceRegion } from '../../content/source'
import keysImage from '../../assets/landing/keys.png'
import lofiImage from '../../assets/landing/lofi.png'
import reactImage from '../../assets/landing/react.png'
import apiImage from '../../assets/landing/api.png'
import { CodeBlock, ParamSelect, ParamSlider, Player } from '../components'
import { href, ROUTES } from '../router'
import './home.css'

const NOTES = ['c4', 'e4', 'g4', 'b4'] as const
const SOUNDS = ['triangle', 'sine', 'square', 'sawtooth'] as const
const EXPLORE = [
  { title: 'Shape a sound', detail: 'Turn a waveform into keys, bass or a beat. Hear every adjustment.', path: ROUTES.keys, image: keysImage, alt: 'Keys sound recipe with envelope, filter and gain controls', width: 1080, height: 743 },
  { title: 'Find your groove', detail: 'Take apart lo-fi chords, house rhythms and full arrangements.', path: ROUTES.lofi, image: lofiImage, alt: 'Lo-fi example showing the live jazzy chords pattern and its code', width: 1080, height: 1041 },
  { title: 'Make it React', detail: 'Connect your own controls. Change the music while it plays.', path: ROUTES.reactMixer, image: reactImage, alt: 'Working React mixer with four part switches and a tempo slider', width: 1017, height: 264 },
  { title: 'Know your tools', detail: 'Look up typed functions and jump to examples that use them.', path: ROUTES.api, image: apiImage, alt: 'API reference explaining fn, chain, pattern and patternCallback', width: 1416, height: 457 },
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
    <code>npm install react-strudel-kit</code>
    <button type="button" onClick={() => void copy()} aria-label={copied ? 'Copied install command' : 'Copy install command'}>{copied ? 'Copied' : 'Copy'}</button>
    <span className="install-feedback" role="status">{failed ? 'Select the command to copy it manually.' : copied ? 'Install command copied.' : ''}</span>
  </div>
}

export function HomePage() {
  const [slots, setSlots] = useState<readonly TuneSlot[]>(NOTES)
  const [sound, setSound] = useState<Waveform>(TUNE_DEFAULTS.sound)
  const [bpm, setBpm] = useState(TUNE_DEFAULTS.bpm)
  const [preview, setPreview] = useState(0)
  const pattern = useMemo(() => myTune({ slots, sound, bpm }), [slots, sound, bpm])

  return <div className="landing">
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-intro">
        <h1 id="landing-title">Turn code<br /> into music.</h1>
        <p>Compose Strudel patterns in TypeScript. Bring them to life with React.</p>
        <a className="landing-action" href={href(ROUTES.firstSong)}>Start making music <span aria-hidden="true">↗</span></a>
        <a className="landing-text-link" href={href(ROUTES.docs)}>Explore the docs <span aria-hidden="true">→</span></a>
      </div>
      <div className="landing-instrument" data-ui>
        <Player id="home-melody" title="Four notes. Your sound." pattern={pattern} headingLevel={2} caption="Press Play, then make it yours. Tap a note to mute it.">
          <div className="landing-notes" aria-label="Melody notes">
            {NOTES.map((note, index) => <button key={note} type="button" aria-label={`Mute ${note.toUpperCase()} ${slots[index] === 'rest' ? 'Rest' : 'On'}`} aria-pressed={slots[index] === 'rest'}
              onClick={() => setSlots((current) => current.map((value, slot) => slot === index ? value === 'rest' ? note : 'rest' : value))}>
              <span>{note.toUpperCase()}</span>{' '}<span className="note-slot" aria-hidden="true">{slots[index] === 'rest' ? 'Rest' : 'On'}</span>
            </button>)}
          </div>
          <div className="landing-sound-controls">
            <ParamSelect label="Sound" value={sound} options={SOUNDS.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} onChange={(value) => setSound(value as Waveform)} />
            <ParamSlider label="Tempo" unit="BPM" value={bpm} min={60} max={160} step={1} hint={['Slower', 'Faster']} onChange={setBpm} />
          </div>
        </Player>
        <pre className="landing-output" tabIndex={0} aria-label="Live Strudel output"><code>{toStrudelCode(pattern)}</code></pre>
      </div>
    </section>

    <section className="landing-compose" aria-labelledby="compose-title">
      <div><h2 id="compose-title">A pattern, typed.</h2><p>Notes, rhythm and sound become composable TypeScript. Build a pattern once, then let React state change what you hear.</p>
        <p>The code here builds the melody above. Change a control and switch to Strudel output to see the pattern it produces.</p>
        <a className="landing-text-link" href={href(ROUTES.firstSong)}>Build your first pattern <span aria-hidden="true">→</span></a></div>
      <div data-ui><CodeBlock source={sourceRegion(firstSongSource, 'my-tune')} pattern={pattern} label="firstSong.ts" /></div>
    </section>

    <section className="landing-discover" aria-labelledby="discover-title">
      <header><h2 id="discover-title">Follow your curiosity.</h2><p>Lessons, sound recipes, examples and API. All together in Docs.</p></header>
      <div className="landing-explorer">
        <div className="landing-explore-links">{EXPLORE.map((item, index) => <a key={item.path} href={href(item.path)} className={preview === index ? 'is-preview' : undefined} onMouseEnter={() => setPreview(index)} onFocus={() => setPreview(index)} aria-describedby={`explore-${index}`}>
          <h3>{item.title} <span aria-hidden="true">↗</span></h3><p id={`explore-${index}`}>{item.detail}</p>
          <img className="landing-mobile-preview" src={item.image} alt={item.alt} width={item.width} height={item.height} loading="lazy" />
        </a>)}</div>
        <div className="landing-preview" aria-hidden="true">{EXPLORE.map((item, index) => <img key={item.path} src={item.image} alt="" width={item.width} height={item.height} loading="lazy" className={preview === index ? 'is-selected' : ''} />)}</div>
      </div>
    </section>

    <section className="landing-close" aria-labelledby="close-title">
      <h2 id="close-title">Make something<br />worth hearing.</h2>
      <div><p>Your components. Your controls. Your music.</p><InstallCommand /><p className="landing-compatibility">React 18+ · TypeScript · Browser audio</p><a href="https://github.com/ngvihoa/react-strudel-kit">Explore the source on GitHub <span aria-hidden="true">↗</span></a></div>
    </section>
  </div>
}
