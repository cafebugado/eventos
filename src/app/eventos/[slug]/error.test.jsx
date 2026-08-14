import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventDetailsError from './error'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('EventDetailsError', () => {
  it('renderiza a mensagem de erro', () => {
    renderWithTheme(<EventDetailsError error={new Error('falha')} reset={vi.fn()} />)
    expect(screen.getByText('Erro ao carregar o evento')).toBeInTheDocument()
  })

  it('chama reset() ao clicar em "Tentar novamente"', async () => {
    const reset = vi.fn()
    renderWithTheme(<EventDetailsError error={new Error('falha')} reset={reset} />)
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(reset).toHaveBeenCalled()
  })
})
