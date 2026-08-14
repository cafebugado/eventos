import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import BackToEventsButton from './BackToEventsButton'

const backMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: backMock }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('BackToEventsButton', () => {
  it('renderiza o label "Voltar para Eventos"', () => {
    renderWithTheme(<BackToEventsButton />)
    expect(screen.getByRole('button', { name: 'Voltar para Eventos' })).toBeInTheDocument()
  })

  it('chama router.back() ao clicar', async () => {
    renderWithTheme(<BackToEventsButton />)
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para Eventos' }))
    expect(backMock).toHaveBeenCalled()
  })
})
