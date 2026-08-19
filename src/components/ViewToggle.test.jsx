import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ViewToggle from './ViewToggle'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ViewToggle', () => {
  it('renderiza os modos sem Lista', () => {
    renderWithTheme(<ViewToggle viewMode="grid" onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Grade' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compacto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calendário' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lista' })).not.toBeInTheDocument()
  })

  it('marca o modo ativo com aria-pressed', () => {
    renderWithTheme(<ViewToggle viewMode="compact" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Compacto' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Grade' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('chama onChange com o id do modo clicado', async () => {
    const onChange = vi.fn()
    renderWithTheme(<ViewToggle viewMode="grid" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Compacto' }))

    expect(onChange).toHaveBeenCalledWith('compact')
  })
})
