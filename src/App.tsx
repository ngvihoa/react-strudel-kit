import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useStrudel } from 'react-strudel-kit/react'
import { DEFAULT_CODE, PLAYGROUND_EXAMPLES } from './examples'
import { usePlaygroundCode } from './hooks/usePlaygroundCode'
import './App.css'

const STORAGE_KEY = 'trudel-playground-code'
const SAVE_LABELS = {
  saved: 'Saved on this device',
  unsaved: 'New draft',
  unavailable: 'Session only',
} as const

function App() {
  const { code, setCode, saveStatus, reset: resetCode } = usePlaygroundCode({ key: STORAGE_KEY, code: DEFAULT_CODE })
  const { status, error, play, stop } = useStrudel()
  const [starting, setStarting] = useState(false)
  const playRequest = useRef(0)
  const editor = useRef<HTMLTextAreaElement>(null)
  const gutter = useRef<HTMLDivElement>(null)

  const start = async () => {
    if (!code.trim()) return
    const request = ++playRequest.current
    setStarting(true)
    try {
      await play(code)
    } finally {
      if (request === playRequest.current) setStarting(false)
    }
  }

  const stopPlayback = () => {
    playRequest.current++
    setStarting(false)
    stop()
  }

  const reset = () => {
    stopPlayback()
    resetCode()
    editor.current?.focus()
  }

  const loadExample = (nextCode: string) => {
    stopPlayback()
    setCode(nextCode)
    editor.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      void start()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      stopPlayback()
    }
  }

  const statusLabel = starting ? 'starting audio…'
    : status === 'playing' ? 'live session'
    : status === 'error' ? 'needs attention' : 'ready to play'

  return (
    <main className="app-shell" onKeyDown={handleKeyDown}>
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Strudel playground home">
          <span className="wordmark-mark" aria-hidden="true">/</span>trudel
        </a>
        <div className="topbar-note" role="status">
          <span className={`status-dot status-${starting ? 'starting' : status}`} aria-hidden="true" />
          {statusLabel}
        </div>
      </header>

      <section className="intro">
        <h1>Write a pattern.<br /><em>Make it play.</em></h1>
        <p className="intro-copy">
          A small place to explore Strudel. Edit a loop, press Play, and hear what changes.
          Everything here runs in your browser.
        </p>
      </section>

      <section className="studio" aria-label="Strudel playground">
        <div className="studio-heading">
          <h2>Make a loop</h2>
          <span className="cycle-label">Start with your volume low</span>
        </div>

        <div className="editor-frame">
          <div className="editor-toolbar">
            <span className="traffic-lights" aria-hidden="true"><i /><i /><i /></span>
            <label className="file-name" htmlFor="pattern-code">Pattern code</label>
            <span className={`save-state save-${saveStatus}`} role="status">{SAVE_LABELS[saveStatus]}</span>
          </div>
          <div className="editor-body">
            <div className="line-numbers" ref={gutter} aria-hidden="true">
              {code.split('\n').map((_, index) => <span key={index}>{String(index + 1).padStart(2, '0')}</span>)}
            </div>
            <textarea
              id="pattern-code"
              ref={editor}
              aria-label="Strudel pattern code"
              aria-describedby={`editor-help${error ? ' pattern-error' : ''}`}
              aria-invalid={error?.code === 'evaluation'}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onScroll={(event) => {
                if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop
              }}
            />
          </div>
        </div>

        <div className="controls-row">
          <div className="button-group">
            <button className="play-button" type="button" onClick={() => void start()}
              disabled={!code.trim()} aria-label="Play pattern" aria-keyshortcuts="Control+Enter Meta+Enter" aria-busy={starting}>
              <span className="play-icon" aria-hidden="true">▶</span> {starting ? 'Starting…' : 'Play pattern'}
            </button>
            <button className="stop-button" type="button" onClick={stopPlayback} aria-keyshortcuts="Escape">Stop</button>
            <button className="reset-button" type="button" onClick={reset}>Reset</button>
          </div>
          <p className="shortcut"><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd> to play · <kbd>Esc</kbd> to stop</p>
        </div>

        <p className="editor-help" id="editor-help">
          {!code.trim() ? 'Enter a pattern to play. ' : 'Edits take effect when you press Play. '}
          {saveStatus === 'unavailable' ? 'Storage is unavailable; copy your code before leaving.' : 'Your edits are saved on this device.'}
        </p>
        {error && <div className="error-box" id="pattern-error" role="alert">
          <p>{error.message}</p>
          <p>{error.code === 'evaluation' ? 'Check your code, then press Play to try again.' : 'Try Play again from a click or keyboard shortcut. Check your browser’s audio permissions if it still fails.'}</p>
        </div>}
      </section>

      <section className="quick-start" aria-labelledby="examples-heading">
        <div>
          <h2 id="examples-heading">Try another sound</h2>
          <p className="section-copy">Built-in synths, ready to play. Loading an example replaces your editor code and stops playback.</p>
        </div>
        <div className="vocabulary-grid">
          {PLAYGROUND_EXAMPLES.map((example) => (
            <button key={example.id} type="button" className="example-button" onClick={() => loadExample(example.code)}
              aria-pressed={code === example.code} aria-label={`Load ${example.name.toLowerCase()} example`}>
              <span className="example-title">{example.name}</span>
              <code>{example.preview}</code>
              <span className="example-description">{example.description}</span>
              <span className="example-action">{code === example.code ? 'In the editor' : 'Load example'} <span aria-hidden="true">↗</span></span>
            </button>
          ))}
        </div>
      </section>

      <footer>
        <span>react-strudel-kit / browser playground</span>
        <a href="https://strudel.cc/learn/mini-notation/" target="_blank" rel="noreferrer">Learn Mini-Notation <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  )
}

export default App
