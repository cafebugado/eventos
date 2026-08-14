import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ThemeToggleSwitch from './ThemeToggleSwitch'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ThemeToggleSwitch', () => {
  it('mostra o ícone de sol e aria-checked=false quando não marcado', () => {
    renderWithTheme(
      <ThemeToggleSwitch checked={false} onChange={vi.fn()} aria-label="Alternar tema" />
    )
    const toggle = screen.getByRole('switch', { name: 'Alternar tema' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByTestId('LightModeOutlinedIcon')).toBeInTheDocument()
  })

  it('mostra o ícone de lua e aria-checked=true quando marcado', () => {
    renderWithTheme(<ThemeToggleSwitch checked onChange={vi.fn()} aria-label="Alternar tema" />)
    const toggle = screen.getByRole('switch', { name: 'Alternar tema' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('DarkModeOutlinedIcon')).toBeInTheDocument()
  })

  it('chama onChange ao clicar', async () => {
    const onChange = vi.fn()
    renderWithTheme(
      <ThemeToggleSwitch checked={false} onChange={onChange} aria-label="Alternar tema" />
    )
    await userEvent.click(screen.getByRole('switch', { name: 'Alternar tema' }))
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
