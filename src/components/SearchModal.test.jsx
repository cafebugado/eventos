import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import SearchModal from './SearchModal'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('SearchModal', () => {
  it('não renderiza o input quando isOpen=false', () => {
    renderWithTheme(<SearchModal isOpen={false} onClose={vi.fn()} value="" onChange={vi.fn()} />)
    expect(screen.queryByPlaceholderText('Buscar evento...')).not.toBeInTheDocument()
  })

  it('renderiza o input quando isOpen=true', () => {
    renderWithTheme(<SearchModal isOpen onClose={vi.fn()} value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Buscar evento...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^buscar$/i })).toBeDisabled()
  })

  it('chama onChange ao digitar', async () => {
    const onChange = vi.fn()
    renderWithTheme(<SearchModal isOpen onClose={vi.fn()} value="" onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText('Buscar evento...'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('exibe botão de limpar quando há valor e chama onChange com string vazia', async () => {
    const onChange = vi.fn()
    renderWithTheme(<SearchModal isOpen onClose={vi.fn()} value="react" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /limpar busca/i }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('chama onSubmit ao clicar em Buscar', async () => {
    const onSubmit = vi.fn()
    renderWithTheme(
      <SearchModal isOpen onClose={vi.fn()} value="react" onChange={vi.fn()} onSubmit={onSubmit} />
    )
    expect(screen.getByRole('button', { name: /^buscar$/i })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }))
    expect(onSubmit).toHaveBeenCalledWith('react')
  })
})
