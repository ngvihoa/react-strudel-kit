import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluate, getAudioContext, hush } from '@strudel/web'
import { toStrudelCode } from 'react-strudel-kit'
import { Site } from './Site'
import { sourceRegion, stripRegions } from '../content/source'
import { FIRST_SONG_STEPS } from '../content/firstSong'

vi.mock('@strudel/web', async () => {
  const { createMockWeb } = await import('../../packages/react-strudel-kit/test/mockWeb')
  return createMockWeb()
})

const go = (path: string) => act(() => {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
})
const player = (title: string) => screen.getByRole('region', { name: `${title} player` })

describe('learning site template', () => {
  beforeEach(() => { vi.clearAllMocks(); window.history.replaceState(null, '', '/'); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}) })
  afterEach(() => { vi.restoreAllMocks() })

  it('opens the playground by default and links every section', () => {
    render(<Site />)
    expect(screen.getByRole('heading', { name: 'Dance Monkey' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Sections' })
    expect(within(nav).getByRole('link', { name: 'Playground' })).toHaveAttribute('aria-current', 'page')
    for (const name of ['Learn', 'Sound Cookbook', 'Examples']) expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
  })

  it('links all five completed lessons', () => {
    go('/learn/first-song')
    render(<Site />)
    expect(screen.getByRole('heading', { level: 1, name: 'Your first song' })).toBeInTheDocument()
    const lessons = screen.getAllByRole('navigation', { name: 'Lessons' })[0]
    expect(within(lessons).getAllByRole('link', { name: /Your first song/ })[0]).toHaveAttribute('aria-current', 'page')
    for (const title of ['Make a beat', 'Add a bass line', 'Layer the parts', 'Control it with React']) {
      expect(within(lessons).getAllByRole('link', { name: title }).length).toBeGreaterThan(0)
    }
    expect(within(lessons).queryByText('Soon')).not.toBeInTheDocument()
  })

  it('follows the lesson Pager chain through every completed lesson', () => {
    go('/learn/first-song')
    render(<Site />)
    for (const title of ['Make a beat', 'Add a bass line', 'Layer the parts', 'Control it with React']) {
      const pager = screen.getByRole('navigation', { name: 'Previous and next' })
      fireEvent.click(within(pager).getByRole('link', { name: new RegExp(`Next.*${title}`) }))
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    }
  })

  it('skips navigation without changing the route or stopping its player', async () => {
    go('/learn/first-song')
    render(<Site />)
    fireEvent.click(screen.getByRole('button', { name: 'Play One note' }))
    await waitFor(() => expect(within(player('One note')).getByText('Playing')).toBeInTheDocument())
    const hushes = vi.mocked(hush).mock.calls.length

    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }))

    expect(window.location.pathname).toBe('/learn/first-song')
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('heading', { level: 1, name: 'Your first song' })).toBeInTheDocument()
    expect(within(player('One note')).getByText('Playing')).toBeInTheDocument()
    expect(vi.mocked(hush).mock.calls.length).toBe(hushes)
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

  it.each(['Stop', 'route change'])('cancels pending audio initialization on %s', async (action) => {
    let release!: () => void
    vi.mocked(getAudioContext().resume).mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve }))
    go('/cookbook/kick')
    render(<Site />)
    fireEvent.click(screen.getByRole('button', { name: 'Play Kick on its own' }))
    expect(within(player('Kick on its own')).getByText('Starting audio…')).toBeInTheDocument()

    if (action === 'Stop') fireEvent.click(screen.getByRole('button', { name: 'Stop Kick on its own' }))
    else go('/playground')
    await act(async () => { release() })

    expect(evaluate).not.toHaveBeenCalled()
    expect(screen.queryByText('Playing')).not.toBeInTheDocument()
    expect(screen.queryByText('Starting audio…')).not.toBeInTheDocument()
  })

  it('shows the Strudel code of the values that are playing', () => {
    go('/cookbook/kick')
    render(<Site />)
    fireEvent.change(screen.getByRole('slider', { name: /Pitch drop/ }), { target: { value: 36 } })
    const code = screen.getByText(/export const kickAlone/).closest('figure') as HTMLElement
    fireEvent.click(within(code).getByRole('button', { name: 'Strudel output' }))
    expect(within(code).getByText(/penv\(36\)/)).toBeInTheDocument()
  })
})

describe('lesson and example content', () => {
  beforeEach(() => { window.history.replaceState(null, '', '/'); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}) })

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

describe('Cookbook and examples', () => {
  beforeEach(() => { window.history.replaceState(null, '', '/'); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}) })

  it.each([
    ['/learn/make-a-beat', 'Make a beat', 'Learn'],
    ['/learn/add-a-bass-line', 'Add a bass line', 'Learn'],
    ['/learn/layer-the-parts', 'Layer the parts', 'Learn'],
    ['/cookbook/kick', 'Kick', 'Sound Cookbook'],
    ['/cookbook/snare', 'Snare', 'Sound Cookbook'],
    ['/cookbook/hi-hat', 'Hi-hat', 'Sound Cookbook'],
    ['/examples/simple-melody', 'A simple melody', 'Examples'],
    ['/examples/four-on-the-floor', 'Four on the floor', 'Examples'],
    ['/examples/backbeat', 'Backbeat', 'Examples'],
    ['/examples/hi-hat-accents', 'Hi-hat accents', 'Examples'],
    ['/cookbook/bass', 'Bass', 'Sound Cookbook'],
    ['/cookbook/keys', 'Keys', 'Sound Cookbook'],
    ['/cookbook/lead', 'Lead', 'Sound Cookbook'],
    ['/cookbook/pad', 'Pad', 'Sound Cookbook'],
    ['/examples/bass-line', 'Bass line', 'Examples'],
    ['/examples/chords-and-arpeggios', 'Chords and arpeggios', 'Examples'],
    ['/examples/layer-a-song', 'Layer a song', 'Examples'],
    ['/examples/lofi-loop', 'Lo-fi loop', 'Examples'],
    ['/examples/house-loop', 'House loop', 'Examples'],
  ])('%s renders with its section current and every code block cut from source', (path, title, section) => {
    go(path)
    render(<Site />)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Sections' })).getByRole('link', { name: section })).toHaveAttribute('aria-current', 'page')
    for (const pre of document.querySelectorAll('pre')) expect(pre.textContent).not.toMatch(/#(region|endregion)/)
    expect(screen.getAllByRole('region', { name: / player$/ }).length).toBeGreaterThan(1)
  })

  it('links a Cookbook sound to the examples that use it, and back', () => {
    go('/cookbook/snare')
    render(<Site />)
    expect(screen.getByText(/^Used in:/)).toContainElement(screen.getByRole('link', { name: 'Backbeat' }))
    go('/examples/backbeat')
    const sounds = screen.getByText('Sounds used').parentElement as HTMLElement
    expect(within(sounds).getByRole('link', { name: 'Snare' })).toHaveAttribute('href', '/cookbook/snare')
  })

  it('updates a sound live from its sliders', () => {
    go('/cookbook/hi-hat')
    render(<Site />)
    fireEvent.change(screen.getByRole('slider', { name: /Off-beat level/ }), { target: { value: 0.2 } })
    const code = screen.getByText(/export const hiHatAlone/).closest('figure') as HTMLElement
    fireEvent.click(within(code).getByRole('button', { name: 'Strudel output' }))
    expect(within(code).getByText(/velocity\("\[1 0\.2\]\*4"\)/)).toBeInTheDocument()
  })
})

describe('React example and API reference', () => {
  beforeEach(() => { window.history.replaceState(null, '', '/'); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}) })

  it.each(['/examples/react-mixer', '/learn/control-it-with-react'])('%s runs the React component and keeps playing while parts change', async (path) => {
    go(path)
    render(<Site />)
    expect(screen.getByRole('heading', { level: 1, name: 'Control it with React' })).toBeInTheDocument()
    const demo = document.querySelector('.react-mixer') as HTMLElement
    expect(document.querySelectorAll('.player')).toHaveLength(0)
    fireEvent.click(within(demo).getByRole('button', { name: 'Play' }))
    await waitFor(() => expect(within(demo).getByText('playing')).toBeInTheDocument())
    fireEvent.click(within(demo).getByRole('checkbox', { name: 'melody' }))
    fireEvent.change(within(demo).getByRole('slider'), { target: { value: 120 } })
    await waitFor(() => expect(within(demo).getByText('playing')).toBeInTheDocument())
    expect(within(demo).getByRole('checkbox', { name: 'melody' })).not.toBeChecked()
  })

  it('lists every registry function, with links to the pages that use it', async () => {
    const { functionRegistry } = await import('react-strudel-kit')
    go('/api')
    render(<Site />)
    expect(within(screen.getByRole('navigation', { name: 'Sections' })).getByRole('link', { name: 'API' })).toHaveAttribute('aria-current', 'page')
    for (const name of Object.keys(functionRegistry)) expect(document.getElementById(`fn-${name}`)).not.toBeNull()
    const velocity = document.getElementById('fn-velocity') as HTMLElement
    expect(within(velocity).getByRole('link', { name: 'Hi-hat accents' })).toHaveAttribute('href', '/examples/hi-hat-accents')
    const swingBy = document.getElementById('fn-swingBy') as HTMLElement
    expect(within(swingBy).getByRole('link', { name: 'Lo-fi loop' })).toBeInTheDocument()
    expect(screen.getByText('c4@2')).toBeInTheDocument()
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
