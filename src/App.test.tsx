import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluate, hush } from '@strudel/web'
import App from './App'
import { DEFAULT_CODE, PLAYGROUND_EXAMPLES } from './examples'

vi.mock('@strudel/web', async () => {
    const { createMockWeb } = await import('../packages/react-strudel-kit/test/mockWeb')
    return createMockWeb()
})

describe('playground using the built React package', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.localStorage.clear()
    })

    afterEach(() => vi.restoreAllMocks())

    it('plays edited code, stops, and restores the default pattern', async () => {
        render(<App />)
        const editor = screen.getByRole('textbox', { name: 'Strudel pattern code' })
        const defaultCode = (editor as HTMLTextAreaElement).value

        fireEvent.change(editor, { target: { value: 'note("c3")' } })
        fireEvent.click(screen.getByRole('button', { name: /Play pattern/ }))

        await waitFor(() => expect(screen.getByText('live session')).toBeInTheDocument())
        expect(evaluate).toHaveBeenCalledWith('note("c3")', false)

        vi.mocked(hush).mockClear()
        fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
        expect(hush).toHaveBeenCalledOnce()
        expect(screen.getByText('ready to play')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
        expect(editor).toHaveValue(defaultCode)
        expect(window.localStorage.getItem('trudel-playground-code')).toBe(defaultCode)
    })

    it('renders a package error and clears it when resetting', async () => {
        vi.mocked(evaluate).mockRejectedValueOnce(new Error('invalid pattern'))
        render(<App />)

        fireEvent.click(screen.getByRole('button', { name: /Play pattern/ }))
        expect(await screen.findByRole('alert')).toHaveTextContent('invalid pattern')

        fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(screen.getByText('ready to play')).toBeInTheDocument()
    })

    it.each(['ctrlKey', 'metaKey'])('plays current edits with %s + Enter', async (modifier) => {
        render(<App />)
        const editor = screen.getByRole('textbox', { name: 'Strudel pattern code' })
        fireEvent.change(editor, { target: { value: 'note("g3")' } })
        fireEvent.keyDown(editor, { key: 'Enter', [modifier]: true })
        await waitFor(() => expect(screen.getByText('live session')).toBeInTheDocument())
        expect(evaluate).toHaveBeenCalledWith('note("g3")', false)
    })

    it('allows Escape to stop while Play is pending and clears starting feedback', async () => {
        let finish!: () => void
        vi.mocked(evaluate).mockImplementationOnce(() => new Promise((resolve) => {
            finish = () => resolve({})
        }))
        render(<App />)
        const editor = screen.getByRole('textbox', { name: 'Strudel pattern code' })
        fireEvent.click(screen.getByRole('button', { name: 'Play pattern' }))
        expect(screen.getByText('starting audio…')).toBeInTheDocument()
        await waitFor(() => expect(evaluate).toHaveBeenCalledOnce())

        fireEvent.keyDown(editor, { key: 'Escape' })
        expect(screen.getByText('ready to play')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Play pattern' })).toHaveAttribute('aria-busy', 'false')
        await act(async () => finish())
        expect(screen.getByText('ready to play')).toBeInTheDocument()
    })

    it('loads an example, stops playback, saves it, and restores editor focus', async () => {
        render(<App />)
        fireEvent.click(screen.getByRole('button', { name: 'Play pattern' }))
        await waitFor(() => expect(screen.getByText('live session')).toBeInTheDocument())
        vi.mocked(evaluate).mockClear()
        vi.mocked(hush).mockClear()

        const loadBass = screen.getByRole('button', { name: 'Load bass example' })
        fireEvent.click(loadBass)
        const editor = screen.getByRole('textbox', { name: 'Strudel pattern code' })
        expect(editor).toHaveValue(PLAYGROUND_EXAMPLES[1].code)
        expect(editor).toHaveFocus()
        expect(loadBass).toHaveAttribute('aria-pressed', 'true')
        expect(hush).toHaveBeenCalledOnce()
        expect(evaluate).not.toHaveBeenCalled()
        expect(window.localStorage.getItem('trudel-playground-code')).toBe(PLAYGROUND_EXAMPLES[1].code)
        expect(screen.getByText('Saved on this device')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
        expect(editor).toHaveValue(DEFAULT_CODE)
    })

    it('does not play an empty pattern from the button or a shortcut', () => {
        render(<App />)
        const editor = screen.getByRole('textbox', { name: 'Strudel pattern code' })
        fireEvent.change(editor, { target: { value: '  \n' } })
        expect(screen.getByRole('button', { name: 'Play pattern' })).toBeDisabled()
        fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })
        expect(evaluate).not.toHaveBeenCalled()
    })

    it('reports failed storage writes without blocking editing or playback', async () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
        render(<App />)
        fireEvent.change(screen.getByRole('textbox', { name: 'Strudel pattern code' }), { target: { value: 'note("c3")' } })
        expect(screen.getByText('Session only')).toBeInTheDocument()
        expect(screen.queryByText('Saved on this device')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Play pattern' }))
        await waitFor(() => expect(screen.getByText('live session')).toBeInTheDocument())
    })
})
