import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ViewToggle from './ViewToggle'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ViewToggle', () => {
  it('renderiza os 4 modos em desktop', () => {
    renderWithTheme(<ViewToggle viewMode="grid" onChange={vi.fn()} isMobile={false} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('esconde o modo "Grade" no mobile', () => {
    renderWithTheme(<ViewToggle viewMode="list" onChange={vi.fn()} isMobile />)
    expect(screen.queryByRole('button', { name: 'Grade' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('marca o modo ativo com aria-pressed', () => {
    renderWithTheme(<ViewToggle viewMode="list" onChange={vi.fn()} isMobile={false} />)
    expect(screen.getByRole('button', { name: 'Lista' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Grade' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('chama onChange com o id do modo clicado', async () => {
    const onChange = vi.fn()
    renderWithTheme(<ViewToggle viewMode="grid" onChange={onChange} isMobile={false} />)

    await userEvent.click(screen.getByRole('button', { name: 'Compacto' }))

    expect(onChange).toHaveBeenCalledWith('compact')
  })
})
