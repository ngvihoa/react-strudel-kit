import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluate, hush } from '@strudel/web'
import type { PatternExpression } from 'react-strudel-kit'
import App from './App'
import { DEFAULT_CODE } from './examples'

const { observePlay, observeUpdate } = vi.hoisted(() => ({ observePlay: vi.fn(), observeUpdate: vi.fn() }))

vi.mock('react-strudel-kit/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-strudel-kit/react')>()
  return {
    ...actual,
    useStrudel: () => {
      const transport = actual.useStrudel()
      return {
        ...transport,
        play: (...args: Parameters<typeof transport.play>) => { observePlay(...args); return transport.play(...args) },
        update: (...args: Parameters<typeof transport.update>) => { observeUpdate(...args); return transport.update(...args) },
      }
    },
  }
})

vi.mock('@strudel/web', async () => {
  const { createMockWeb } = await import('../packages/react-strudel-kit/test/mockWeb')
  return createMockWeb()
})

const slider = (name: string, value: number) => fireEvent.change(screen.getByRole('slider', { name }), { target: { value } })
const playMix = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Play mix' }))
  await waitFor(() => expect(screen.getByText('Playing')).toBeInTheDocument())
}
const renderEditor = () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Code editor' }))
}

describe('interactive React music playground', () => {
  beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear() })
  afterEach(() => vi.restoreAllMocks())

  it('opens Dance Monkey with working controls and waits for an explicit Play', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Dance Monkey' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Tempo/ })).toHaveValue('98')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    slider('Tempo', 110)
    slider('Master volume', 60)
    slider('Bass volume', 40)
    fireEvent.click(screen.getByRole('button', { name: 'Mute Melody' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Bass sound' }), { target: { value: 'square' } })
    expect(observePlay).not.toHaveBeenCalled()
    expect(observeUpdate).not.toHaveBeenCalled()
    await playMix()
    const input = observePlay.mock.calls[0][0] as PatternExpression
    expect(typeof input).toBe('object')
    expect(input.root.name).toBe('stack')
    expect(input.root.args).toHaveLength(5)
    expect(evaluate).toHaveBeenCalledWith(expect.stringContaining('.cpm(27.5)'), false)
    expect(evaluate).toHaveBeenCalledWith(expect.stringContaining('.velocity(0.4).s("square")'), false)
    expect(evaluate).toHaveBeenCalledWith(expect.stringContaining('.postgain(0.6)'), false)
  })

  it('updates tempo, level and sound live without restarting playback', async () => {
    render(<App />)
    await playMix()
    vi.mocked(hush).mockClear()
    slider('Tempo', 122)
    slider('Melody volume', 30)
    fireEvent.change(screen.getByRole('combobox', { name: 'Melody sound' }), { target: { value: 'sine' } })
    await waitFor(() => expect(evaluate).toHaveBeenLastCalledWith(expect.stringContaining('.cpm(30.5)'), false))
    expect(observePlay).toHaveBeenCalledOnce()
    expect(observeUpdate).toHaveBeenCalledTimes(3)
    expect(hush).not.toHaveBeenCalled()
    expect(screen.getByText('Playing')).toBeInTheDocument()
  })

  it('supports multiple solo parts and makes a newly soloed part audible', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Solo Melody' }))
    expect(screen.getByText('1 of 6 parts on')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mute Bass' }))
    fireEvent.click(screen.getByRole('button', { name: 'Solo Bass' }))
    expect(screen.getByRole('button', { name: 'Mute Bass' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('2 of 6 parts on')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mute Melody' }))
    expect(screen.getByRole('button', { name: 'Solo Melody' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('1 of 6 parts on')).toBeInTheDocument()
  })

  it('resets the current mix while preserving running playback', async () => {
    render(<App />)
    await playMix()
    slider('Tempo', 75)
    slider('Master volume', 0)
    slider('Bass volume', 15)
    fireEvent.click(screen.getByRole('button', { name: 'Solo Bass' }))
    vi.mocked(hush).mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Reset mix' }))
    expect(screen.getByRole('slider', { name: 'Tempo' })).toHaveValue('98')
    expect(screen.getByRole('slider', { name: 'Master volume' })).toHaveValue('80')
    expect(screen.getByRole('slider', { name: 'Bass volume' })).toHaveValue('100')
    expect(screen.getByText('6 of 6 parts on')).toBeInTheDocument()
    await waitFor(() => expect(evaluate).toHaveBeenLastCalledWith(expect.stringContaining('.cpm(24.5)'), false))
    expect(observePlay).toHaveBeenCalledOnce()
    expect(hush).not.toHaveBeenCalled()
  })

  it('keeps Stop effective when sliders change during pending Play', async () => {
    let finish!: () => void
    vi.mocked(evaluate).mockImplementationOnce(() => new Promise((resolve) => { finish = () => resolve({}) }))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Play mix' }))
    await waitFor(() => expect(evaluate).toHaveBeenCalledOnce())
    slider('Tempo', 120)
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByText('Ready')).toBeInTheDocument()
    await act(async () => finish())
    expect(screen.getByText('Ready')).toBeInTheDocument()
    slider('Bass volume', 20)
    expect(observePlay).toHaveBeenCalledTimes(2)
    expect(observeUpdate).not.toHaveBeenCalled()
  })

  it('switches arrangements without autoplay and resets that arrangement only', async () => {
    render(<App />)
    await playMix()
    fireEvent.change(screen.getByRole('combobox', { name: 'Arrangement' }), { target: { value: 'bass' } })
    expect(screen.getByText('Ready')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bass line' })).toBeInTheDocument()
    expect(screen.getByText('1 of 1 parts on')).toBeInTheDocument()
    expect(observePlay).toHaveBeenCalledOnce()
    slider('Tempo', 90)
    fireEvent.click(screen.getByRole('button', { name: 'Reset mix' }))
    expect(screen.getByRole('slider', { name: 'Tempo' })).toHaveValue('120')
    expect(screen.getByRole('heading', { name: 'Bass line' })).toBeInTheDocument()
  })

  it('explains a quiet mix and allows restoring all parts', () => {
    render(<App />)
    for (const name of ['Melody', 'Bass', 'Keys', 'Kick', 'Snare', 'Hi-hat']) {
      fireEvent.click(screen.getByRole('button', { name: `Mute ${name}` }))
    }
    expect(screen.getByText(/No parts are audible/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reset mix' }))
    expect(screen.getByText('6 of 6 parts on')).toBeInTheDocument()
    slider('Master volume', 0)
    expect(screen.getByText(/Master volume is at 0%/)).toBeInTheDocument()
  })

  it('reports playback errors and retries with a new Play', async () => {
    vi.mocked(evaluate).mockRejectedValueOnce(new Error('audio failed'))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Play mix' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('audio failed')
    expect(screen.getByText('Needs attention')).toBeInTheDocument()
    await playMix()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it.each(['ctrlKey', 'metaKey'])('plays the mix with %s + Enter and stops with Escape', async (modifier) => {
    render(<App />)
    const tempo = screen.getByRole('slider', { name: 'Tempo' })
    fireEvent.keyDown(tempo, { key: 'Enter', [modifier]: true })
    await waitFor(() => expect(screen.getByText('Playing')).toBeInTheDocument())
    fireEvent.keyDown(tempo, { key: 'Escape' })
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('preserves independent editor drafts and mixer settings when changing modes', async () => {
    renderEditor()
    const editor = screen.getByRole('textbox', { name: 'Strudel pattern code' })
    fireEvent.change(editor, { target: { value: 'note("g4")' } })
    fireEvent.click(screen.getByRole('button', { name: 'Play pattern' }))
    await waitFor(() => expect(screen.getByText('Playing')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Mixer' }))
    expect(screen.getByText('Ready')).toBeInTheDocument()
    slider('Tempo', 105)
    fireEvent.click(screen.getByRole('button', { name: 'Code editor' }))
    expect(screen.getByRole('textbox')).toHaveValue('note("g4")')
    expect(window.localStorage.getItem('trudel-playground-code')).toBe('note("g4")')
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('textbox')).toHaveValue(DEFAULT_CODE)
    fireEvent.click(screen.getByRole('button', { name: 'Mixer' }))
    expect(screen.getByRole('slider', { name: 'Tempo' })).toHaveValue('105')
  })

  it('does not play an empty editor draft and tolerates failed storage', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    renderEditor()
    const editor = screen.getByRole('textbox')
    fireEvent.change(editor, { target: { value: '  \n' } })
    expect(screen.getByRole('button', { name: 'Play pattern' })).toBeDisabled()
    fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })
    expect(observePlay).not.toHaveBeenCalled()
    expect(screen.getByText('Session only')).toBeInTheDocument()
    fireEvent.change(editor, { target: { value: 'note("c3")' } })
    fireEvent.click(screen.getByRole('button', { name: 'Play pattern' }))
    await waitFor(() => expect(screen.getByText('Playing')).toBeInTheDocument())
    expect(evaluate).toHaveBeenLastCalledWith('note("c3")', false)
  })
})
