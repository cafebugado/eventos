import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import FilterModal from './FilterModal'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const tags = [
  { id: 1, nome: 'React' },
  { id: 2, nome: 'Node' },
]

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  tags,
  onApplyFilters: vi.fn(),
  selectedTagId: '',
  onSelectTag: vi.fn(),
  dateFrom: '',
  dateTo: '',
  onDateFrom: vi.fn(),
  onDateTo: vi.fn(),
  onClearFilters: vi.fn(),
  locationOptions: [],
  selectedLocation: '',
  onSelectLocation: vi.fn(),
}

describe('FilterModal', () => {
  it('renderiza os inputs de seleção de filtro', () => {
    renderWithTheme(<FilterModal {...baseProps} />)

    expect(screen.getByRole('combobox', { name: /tag/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /local/i })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('não renderiza o switch de eventos passados', () => {
    renderWithTheme(<FilterModal {...baseProps} />)
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('mantém os botões desabilitados quando não há filtros selecionados', () => {
    renderWithTheme(<FilterModal {...baseProps} />)

    expect(screen.getByRole('button', { name: /limpar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /ver resultados/i })).toBeDisabled()
  })

  it('habilita os botões quando há filtros ativos ao abrir', () => {
    renderWithTheme(<FilterModal {...baseProps} selectedTagId="1" dateFrom="2999-01-01" />)

    expect(screen.getByRole('button', { name: /limpar/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /ver resultados/i })).toBeEnabled()
  })

  it('renderiza as opções de local disponíveis', () => {
    renderWithTheme(<FilterModal {...baseProps} locationOptions={['São Paulo', 'Online']} />)

    expect(screen.getByRole('combobox', { name: /local/i })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('aplica tag, local e data somente ao clicar em Ver resultados', async () => {
    const onApplyFilters = vi.fn()
    const onClose = vi.fn()
    renderWithTheme(
      <FilterModal
        {...baseProps}
        locationOptions={['São Paulo', 'Online']}
        onApplyFilters={onApplyFilters}
        onClose={onClose}
      />
    )

    await userEvent.click(screen.getByRole('combobox', { name: /tag/i }))
    await userEvent.click(screen.getByRole('option', { name: 'React' }))
    await userEvent.click(screen.getByRole('combobox', { name: /local/i }))
    await userEvent.click(screen.getByRole('option', { name: 'São Paulo' }))
    fireEvent.change(screen.getByLabelText(/data/i), { target: { value: '2999-01-01' } })

    expect(onApplyFilters).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /ver resultados/i }))
    expect(onApplyFilters).toHaveBeenCalledWith({
      tag: '1',
      local: 'São Paulo',
      from: '2999-01-01',
      to: '',
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('limpa os filtros selecionados', async () => {
    const onClearFilters = vi.fn()
    renderWithTheme(
      <FilterModal
        {...baseProps}
        locationOptions={['São Paulo']}
        selectedTagId="1"
        selectedLocation="São Paulo"
        onClearFilters={onClearFilters}
      />
    )

    const clearButton = screen.getByRole('button', { name: /limpar/i })
    await userEvent.click(clearButton)

    expect(onClearFilters).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /limpar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /ver resultados/i })).toBeDisabled()
  })
})
