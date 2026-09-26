import './App.css'
import { useStrudel } from './hooks/useStrudel'

const STORAGE_KEY = 'trudel-playground-code'
const DEFAULT_CODE = `setcpm(110)
stack(
  s("bd ~ bd [~ bd]"),
  s("~ hh*2 ~ hh*2").gain(.55),
  note("<c3 eb3 f3 g3>").s("triangle").lpf(900)
)`


function App() {
  const { code, setCode, status, error, play, stop, reset } = useStrudel({ key: STORAGE_KEY, code: DEFAULT_CODE })

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Strudel playground home">
          <span className="wordmark-mark">/</span>trudel
        </a>
        <div className="topbar-note">
          <span className={`status-dot status-${status}`} />
          {status === 'playing' ? 'live session' : status === 'error' ? 'needs attention' : 'ready to play'}
        </div>
      </header>

      <section className="intro">
        <p className="eyebrow">A small place to make sound</p>
        <h1>Write a pattern.<br /><em>Hear it become alive.</em></h1>
        <p className="intro-copy">
          A first, friendly playground for exploring Strudel patterns in React.
          Edit the code, then let the browser do the rhythmic thinking.
        </p>
      </section>

      <section className="studio" aria-label="Strudel playground">
        <div className="studio-heading">
          <div>
            <span className="section-kicker">01 / pattern editor</span>
            <h2>Make a loop</h2>
          </div>
          <span className="cycle-label">browser audio / cycle 01</span>
        </div>

        <div className="editor-frame">
          <div className="editor-toolbar">
            <span className="traffic-lights"><i /><i /><i /></span>
            <span className="file-name">untitled.strudel.js</span>
            <span className="save-state">saved locally</span>
          </div>
          <div className="editor-body">
            <div className="line-numbers" aria-hidden="true">
              {code.split('\n').map((_, index) => <span key={index}>{String(index + 1).padStart(2, '0')}</span>)}
            </div>
            <textarea
              aria-label="Strudel pattern code"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
        </div>

        <div className="controls-row">
          <div className="button-group">
            <button className="play-button" type="button" onClick={play}>
              <span className="play-icon">▶</span> Play pattern
            </button>
            <button className="stop-button" type="button" onClick={stop}>Stop</button>
            <button className="reset-button" type="button" onClick={reset}>Reset</button>
          </div>
          <p className="shortcut"><kbd>⌘</kbd><kbd>↵</kbd> to play</p>
        </div>

        {error && <div className="error-box" role="alert">{error}</div>}
      </section>

      <section className="quick-start">
        <div>
          <span className="section-kicker">02 / tiny vocabulary</span>
          <h2>Three ways in.</h2>
        </div>
        <div className="vocabulary-grid">
          <article><code>s("bd sd")</code><p>samples</p></article>
          <article><code>note("c3 e3 g3")</code><p>notes</p></article>
          <article><code>stack(a, b)</code><p>layers</p></article>
        </div>
      </section>

      <footer>
        <span>react-strudel-toolkit / first sketch</span>
        <a href="https://strudel.cc/learn/mini-notation/" target="_blank" rel="noreferrer">mini-notation ↗</a>
      </footer>
    </main>
  )
}

export default App
