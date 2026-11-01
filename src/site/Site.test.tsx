import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hush } from '@strudel/web'
import { toStrudelCode } from 'react-strudel-kit'
import { Site } from './Site'
import { sourceRegion, stripRegions } from '../content/source'
import { FIRST_SONG_STEPS } from '../content/firstSong'

vi.mock('@strudel/web', async () => {
  const { createMockWeb } = await import('../../packages/react-strudel-kit/test/mockWeb')
  return createMockWeb()
})

const go = (path: string) => act(() => {
  window.location.hash = path
  window.dispatchEvent(new HashChangeEvent('hashchange'))
})
const player = (title: string) => screen.getByRole('region', { name: `${title} player` })

describe('learning site template', () => {
  beforeEach(() => { vi.clearAllMocks(); window.location.hash = ''; vi.spyOn(window, 'scrollTo').mockImplementation(() => {}) })
  afterEach(() => { vi.restoreAllMocks() })

  it('opens the playground by default and links every section', () => {
    render(<Site />)
    expect(screen.getByRole('heading', { name: 'Dance Monkey' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Sections' })
    expect(within(nav).getByRole('link', { name: 'Playground' })).toHaveAttribute('aria-current', 'page')
    for (const name of ['Learn', 'Sound Cookbook', 'Examples']) expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
  })

  it('shows planned pages without links', () => {
    go('/learn/first-song')
    render(<Site />)
    expect(screen.getByRole('heading', { level: 1, name: 'Your first song' })).toBeInTheDocument()
    const lessons = screen.getAllByRole('navigation', { name: 'Lessons' })[0]
    expect(within(lessons).getAllByRole('link', { name: /Your first song/ })[0]).toHaveAttribute('aria-current', 'page')
    expect(within(lessons).queryAllByRole('link', { name: /Make a beat/ })).toHaveLength(0)
  })

  it('marks only the player that started playback as playing', async () => {
    go('/learn/first-song')
    render(<Site />)
    fireEvent.click(screen.getByRole('button', { name: 'Play One note' }))
    await waitFor(() => expect(within(player('One note')).getByText('Playing')).toBeInTheDocument())
    expect(within(player('Four notes')).getByText('Ready')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Play Four notes' }))
    await waitFor(() => expect(within(player('Four notes')).getByText('Playing')).toBeInTheDocument())
    expect(within(player('One note')).getByText('Ready')).toBeInTheDocument()

    // Stop on a player that is not playing leaves the other one running.
    const hushes = vi.mocked(hush).mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: 'Stop One note' }))
    expect(vi.mocked(hush).mock.calls.length).toBe(hushes)
    expect(within(player('Four notes')).getByText('Playing')).toBeInTheDocument()
  })

  it('stops playback when leaving a page', async () => {
    go('/cookbook/kick')
    render(<Site />)
    fireEvent.click(screen.getByRole('button', { name: 'Play Kick on its own' }))
    await waitFor(() => expect(within(player('Kick on its own')).getByText('Playing')).toBeInTheDocument())
    const hushes = vi.mocked(hush).mock.calls.length
    go('/examples/dance-monkey')
    expect(vi.mocked(hush).mock.calls.length).toBeGreaterThan(hushes)
    expect(within(player('Dance Monkey')).getByText('Ready')).toBeInTheDocument()
  })

  it('shows the Strudel code of the values that are playing', () => {
    go('/cookbook/kick')
    render(<Site />)
    fireEvent.change(screen.getByRole('slider', { name: /Pitch drop/ }), { target: { value: 36 } })
    const code = screen.getAllByRole('figure')[0]
    fireEvent.click(within(code).getByRole('button', { name: 'Strudel output' }))
    expect(within(code).getByText(/penv\(36\)/)).toBeInTheDocument()
  })
})

describe('lesson and example content', () => {
  beforeEach(() => { window.location.hash = ''; vi.spyOn(window, 'scrollTo').mockImplementation(() => {}) })

  it('shows the values chosen in Make it yours', () => {
    go('/learn/first-song')
    render(<Site />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Slot 4' }), { target: { value: 'c5' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Sound' }), { target: { value: 'square' } })
    const code = screen.getByText(/export const myTune/).closest('figure')!
    fireEvent.click(within(code as HTMLElement).getByRole('button', { name: 'Strudel output' }))
    expect(within(code as HTMLElement).getByText(/note\("c4 e4 g4 c5"\)\.s\("square"\)/)).toBeInTheDocument()
  })

  it('explains Dance Monkey part by part, each with its own player', () => {
    go('/examples/dance-monkey')
    render(<Site />)
    for (const name of ['Melody', 'Bass', 'Keys', 'Drums', 'Put it together']) expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    for (const title of ['Melody alone', 'Bass alone', 'Keys alone', 'Drums alone', 'Full song']) expect(player(title)).toBeInTheDocument()
  })
})

describe('sourceRegion', () => {
  it('extracts a dedented region so shown code matches the module', () => {
    const source = 'a\n  // #region demo\n  const x = 1\n    + 2\n  // #endregion\nb'
    expect(sourceRegion(source, 'demo')).toBe('const x = 1\n  + 2')
    expect(() => sourceRegion(source, 'missing')).toThrow('Missing source region "missing"')
  })

  it('lesson steps serialize to playable Strudel code', () => {
    expect(toStrudelCode(FIRST_SONG_STEPS.fourNotes)).toContain('note("c4 e4 g4 b4")')
    // The weight/repeat comparison gives C the same half bar: held once vs struck twice.
    expect(toStrudelCode(FIRST_SONG_STEPS.held)).toContain('note("c4@2 e4 g4")')
    expect(toStrudelCode(FIRST_SONG_STEPS.repeated)).toContain('note("[c4*2]@2 e4 g4")')
  })

  it('removes region markers from a full-file view', () => {
    expect(stripRegions('a\n  // #region x\nb\n  // #endregion\nc')).toBe('a\nb\nc')
  })
})
