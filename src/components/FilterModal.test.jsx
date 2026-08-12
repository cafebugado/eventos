import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  selectedTagId: '',
  onSelectTag: vi.fn(),
  dateFrom: '',
  dateTo: '',
  onDateFrom: vi.fn(),
  onDateTo: vi.fn(),
  locationOptions: [],
  selectedLocation: '',
  onSelectLocation: vi.fn(),
}

describe('FilterModal', () => {
  it('renderiza as tags disponíveis', () => {
    renderWithTheme(<FilterModal {...baseProps} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
  })

  it('chama onSelectTag ao clicar em uma tag', async () => {
    const onSelectTag = vi.fn()
    renderWithTheme(<FilterModal {...baseProps} onSelectTag={onSelectTag} />)
    await userEvent.click(screen.getByText('React'))
    expect(onSelectTag).toHaveBeenCalledWith('1')
  })

  it('não renderiza o switch de eventos passados', () => {
    renderWithTheme(<FilterModal {...baseProps} />)
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('não exibe "Limpar filtros" quando não há filtros ativos', () => {
    renderWithTheme(<FilterModal {...baseProps} />)
    expect(screen.queryByText(/limpar filtros/i)).not.toBeInTheDocument()
  })

  it('exibe "Limpar filtros" com contagem quando há filtros ativos', () => {
    renderWithTheme(<FilterModal {...baseProps} selectedTagId="1" dateFrom="2999-01-01" />)
    expect(screen.getByText(/limpar filtros \(2\)/i)).toBeInTheDocument()
  })

  it('não exibe a seção Local quando não há opções', () => {
    renderWithTheme(<FilterModal {...baseProps} locationOptions={[]} />)
    expect(screen.queryByText('Local')).not.toBeInTheDocument()
  })

  it('renderiza as opções de local disponíveis', () => {
    renderWithTheme(<FilterModal {...baseProps} locationOptions={['São Paulo', 'Online']} />)
    expect(screen.getByText('Local')).toBeInTheDocument()
    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('chama onSelectLocation ao clicar em uma opção de local', async () => {
    const onSelectLocation = vi.fn()
    renderWithTheme(
      <FilterModal
        {...baseProps}
        locationOptions={['São Paulo', 'Online']}
        onSelectLocation={onSelectLocation}
      />
    )
    await userEvent.click(screen.getByText('São Paulo'))
    expect(onSelectLocation).toHaveBeenCalledWith('São Paulo')
  })

  it('desmarca o local ao clicar novamente na opção já selecionada', async () => {
    const onSelectLocation = vi.fn()
    renderWithTheme(
      <FilterModal
        {...baseProps}
        locationOptions={['São Paulo', 'Online']}
        selectedLocation="São Paulo"
        onSelectLocation={onSelectLocation}
      />
    )
    await userEvent.click(screen.getByText('São Paulo'))
    expect(onSelectLocation).toHaveBeenCalledWith('')
  })

  it('inclui o local na contagem de "Limpar filtros" e zera ao clicar', async () => {
    const onSelectLocation = vi.fn()
    renderWithTheme(
      <FilterModal
        {...baseProps}
        locationOptions={['São Paulo']}
        selectedLocation="São Paulo"
        onSelectLocation={onSelectLocation}
      />
    )
    const clearButton = screen.getByText(/limpar filtros \(1\)/i)
    await userEvent.click(clearButton)
    expect(onSelectLocation).toHaveBeenCalledWith('')
  })
})
