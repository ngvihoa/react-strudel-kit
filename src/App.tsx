import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useStrudel } from 'react-strudel-kit/react'
import type { StrudelInput } from 'react-strudel-kit'
import { DANCE_MONKEY, DEFAULT_CODE, PLAYGROUND_EXAMPLES } from './examples'
import { audibleParts, buildMix, createMixSettings } from './mixer'
import type { MixSettings, TrackMix } from './mixer'
import { TrackControls } from './components/TrackControls'
import { usePlaygroundCode } from './hooks/usePlaygroundCode'
import './App.css'

const SAVE_LABELS = { saved: 'Saved on this device', unsaved: 'New draft', unavailable: 'Session only' } as const

function App() {
  const [session, setSession] = useState(() => ({ arrangement: DANCE_MONKEY, mix: createMixSettings(DANCE_MONKEY) }))
  // Event handlers share the latest mix even during a burst of slider changes.
  const sessionRef = useRef(session)
  const { arrangement, mix } = session
  const [mode, setMode] = useState<'mixer' | 'editor'>('mixer')
  const { code, setCode, saveStatus, reset: resetCode } = usePlaygroundCode({ key: 'trudel-playground-code', code: DEFAULT_CODE })
  const { status, error, play, update, stop } = useStrudel()
  const [starting, setStarting] = useState(false)
  const playRequest = useRef(0)
  const editor = useRef<HTMLTextAreaElement>(null)
  const gutter = useRef<HTMLDivElement>(null)

  const start = async (input?: StrudelInput) => {
    if (mode === 'editor' && !code.trim()) return
    const request = ++playRequest.current
    setStarting(true)
    try {
      const active = sessionRef.current
      await play(input ?? (mode === 'mixer' ? buildMix(active.arrangement, active.mix) : code))
    } finally {
      if (request === playRequest.current) setStarting(false)
    }
  }

  const stopPlayback = () => {
    playRequest.current++
    setStarting(false)
    stop()
  }

  const changeMix = (change: (current: MixSettings) => MixSettings) => {
    const active = sessionRef.current
    const next = { ...active, mix: change(active.mix) }
    sessionRef.current = next
    setSession(next)
    const pattern = buildMix(next.arrangement, next.mix)
    if (status === 'playing') void update(pattern)
    else if (starting) void start(pattern)
  }

  const changeTrack = (id: string, change: Partial<TrackMix>) => changeMix((current) => ({
    ...current, tracks: { ...current.tracks, [id]: { ...current.tracks[id], ...change } },
  }))

  const reset = () => {
    if (mode === 'mixer') {
      if (status === 'error') stopPlayback()
      changeMix(() => createMixSettings(sessionRef.current.arrangement))
    } else {
      stopPlayback()
      resetCode()
      editor.current?.focus()
    }
  }

  const changeArrangement = (id: string) => {
    const next = PLAYGROUND_EXAMPLES.find((entry) => entry.id === id)
    if (!next) return
    stopPlayback()
    const nextSession = { arrangement: next, mix: createMixSettings(next) }
    sessionRef.current = nextSession
    setSession(nextSession)
  }

  const changeMode = (next: typeof mode) => {
    if (next === mode) return
    stopPlayback()
    setMode(next)
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

  const audible = audibleParts(arrangement, mix)
  const statusLabel = starting ? 'Starting audio…' : status === 'playing' ? 'Playing' : status === 'error' ? 'Needs attention' : 'Ready'

  return (
    <main className="app-shell" onKeyDown={handleKeyDown}>
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Strudel playground home"><span className="wordmark-mark" aria-hidden="true">/</span>trudel <span className="wordmark-caption">music playground</span></a>
        <div className="topbar-note" role="status"><span className={`status-dot status-${starting ? 'starting' : status}`} aria-hidden="true" />{statusLabel}</div>
      </header>

      <section className="studio" aria-label="Music playground">
        <div className="mode-switch" role="group" aria-label="Playground mode">
          <button type="button" aria-pressed={mode === 'mixer'} onClick={() => changeMode('mixer')}>Mixer</button>
          <button type="button" aria-pressed={mode === 'editor'} onClick={() => changeMode('editor')}>Code editor</button>
        </div>

        <div className="studio-heading">
          <div>
            <p className="eyebrow">{mode === 'mixer' ? 'Make it your mix' : 'Try your own pattern'}</p>
            <h1>{mode === 'mixer' ? arrangement.name : 'Code editor'}</h1>
            <p className="arrangement-description">{mode === 'mixer' ? arrangement.description : 'Write a pattern and play your changes.'}</p>
          </div>
          {mode === 'mixer' && <div className="arrangement-picker">
            <label htmlFor="arrangement">Arrangement</label>
            <select id="arrangement" value={arrangement.id} onChange={(event) => changeArrangement(event.target.value)}>
              {PLAYGROUND_EXAMPLES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </select>
          </div>}
        </div>

        <div className="controls-row">
          <div className="button-group">
            <button className="play-button" type="button" onClick={() => void start()} disabled={mode === 'editor' && !code.trim()}
              aria-label={mode === 'mixer' ? 'Play mix' : 'Play pattern'} aria-keyshortcuts="Control+Enter Meta+Enter" aria-busy={starting}>
              <span className="play-icon" aria-hidden="true">▶</span>{starting ? 'Starting…' : 'Play'}
            </button>
            <button className="stop-button" type="button" onClick={stopPlayback} aria-keyshortcuts="Escape">Stop</button>
            <button className="reset-button" type="button" onClick={reset}>{mode === 'mixer' ? 'Reset mix' : 'Reset'}</button>
          </div>
          <p className="shortcut"><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd> to play · <kbd>Esc</kbd> to stop</p>
        </div>

        {mode === 'mixer' ? <>
          <p className="playback-hint">{status === 'playing' ? 'Your changes are live. Try taking out the melody or soloing the bass.' : 'Press Play, then change the sound as it runs. Start with your device volume low.'}</p>
          <div className="mix-controls">
            <div className="range-control">
              <label htmlFor="tempo">Tempo <output htmlFor="tempo">{mix.bpm} <span>BPM</span></output></label>
              <input id="tempo" type="range" min="60" max="160" step="1" value={mix.bpm} aria-label="Tempo" aria-valuetext={`${mix.bpm} beats per minute`}
                onChange={(event) => changeMix((current) => ({ ...current, bpm: Number(event.target.value) }))} />
              <div className="range-limits"><span>Slower · 60</span><span>160 · Faster</span></div>
            </div>
            <div className="range-control">
              <label htmlFor="master-volume">Master volume <output htmlFor="master-volume">{mix.volume}%</output></label>
              <input id="master-volume" type="range" min="0" max="100" step="1" value={mix.volume} aria-label="Master volume" aria-valuetext={`${mix.volume} percent`}
                onChange={(event) => changeMix((current) => ({ ...current, volume: Number(event.target.value) }))} />
              <div className="range-limits"><span>Quiet</span><span>Loud</span></div>
            </div>
          </div>

          <div className="mix-heading"><h2>The parts</h2><span>{audible.length} of {arrangement.parts.length} parts on</span></div>
          <div className="track-list" role="group" aria-label="Arrangement parts">
            {arrangement.parts.map((part) => <TrackControls key={`${arrangement.id}-${part.id}`} part={part} mix={mix.tracks[part.id]}
              audible={audible.some((entry) => entry.id === part.id)} onChange={(change) => changeTrack(part.id, change)} />)}
          </div>
          <p className="mix-hint">{mix.volume === 0 ? 'Master volume is at 0%. Raise it to hear your mix.'
            : audible.length === 0 ? 'No parts are audible. Raise a level, unmute a part, or reset the mix.'
              : 'Mute removes a part. Solo lets you hear just that part; select more than one to hear them together.'}</p>
          <div className="arrangement-facts"><span>{arrangement.key}</span><span>4/4 time</span><span>{arrangement.bars}-bar loop · {(arrangement.bars * 4 * 60 / mix.bpm).toFixed(1)} seconds</span></div>
        </> : <>
          <div className="editor-frame">
            <div className="editor-toolbar"><label htmlFor="pattern-code">Pattern code</label><span className="save-state" role="status">{SAVE_LABELS[saveStatus]}</span></div>
            <div className="editor-body">
              <div className="line-numbers" ref={gutter} aria-hidden="true">{code.split('\n').map((_, index) => <span key={index}>{String(index + 1).padStart(2, '0')}</span>)}</div>
              <textarea id="pattern-code" ref={editor} aria-label="Strudel pattern code" aria-describedby={`editor-help${error ? ' pattern-error' : ''}`}
                aria-invalid={error?.code === 'evaluation'} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" value={code}
                onChange={(event) => setCode(event.target.value)} onScroll={(event) => { if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop }} />
            </div>
          </div>
          <p className="editor-help" id="editor-help">{!code.trim() ? 'Enter a pattern to play. ' : 'Press Play to apply your edits. '}{saveStatus === 'unavailable' ? 'Storage is unavailable; copy your code before leaving.' : 'Your draft is kept when you return to the mixer.'}</p>
        </>}
        {error && <div className="error-box" id="pattern-error" role="alert"><p>{error.message}</p><p>Press Play to try again. Check your code or browser audio permissions if it still fails.</p></div>}
      </section>
      <footer><span>Made to be played with.</span><span>Audio stays in your browser.</span></footer>
    </main>
  )
}

export default App
