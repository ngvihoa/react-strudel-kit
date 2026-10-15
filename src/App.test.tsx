import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluate, hush } from '@strudel/web'
import App from './App'

vi.mock('@strudel/web', async () => {
    const { createMockWeb } = await import('../packages/react-strudel-kit/test/mockWeb')
    return createMockWeb()
})

describe('playground using the built React package', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.localStorage.clear()
    })

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
})
