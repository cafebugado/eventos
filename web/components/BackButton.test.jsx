import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import BackButton from './BackButton'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('BackButton', () => {
  it('usa o label padrão "Voltar"', () => {
    renderWithTheme(<BackButton onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
  })

  it('aceita um label customizado', () => {
    renderWithTheme(<BackButton onClick={vi.fn()} label="Voltar para eventos" />)
    expect(screen.getByRole('button', { name: 'Voltar para eventos' })).toBeInTheDocument()
  })

  it('chama onClick ao clicar', async () => {
    const onClick = vi.fn()
    renderWithTheme(<BackButton onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
