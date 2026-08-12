import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsFilters from './EventsFilters'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const baseProps = {
  searchTerm: '',
  onSearchChange: vi.fn(),
  selectedTagId: '',
  onSelectTag: vi.fn(),
  showPastEvents: false,
  onTogglePast: vi.fn(),
  dateFrom: '',
  dateTo: '',
  onDateFrom: vi.fn(),
  onDateTo: vi.fn(),
  filterActiveCount: 0,
  viewMode: 'grid',
  onChangeViewMode: vi.fn(),
  tags: [],
  isMobile: false,
  locationOptions: [],
  selectedLocation: '',
  onSelectLocation: vi.fn(),
}

describe('EventsFilters', () => {
  it('renderiza o botão de busca e o de filtros', () => {
    renderWithTheme(<EventsFilters {...baseProps} />)
    expect(screen.getByRole('button', { name: /abrir busca/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filtros/i })).toBeInTheDocument()
  })

  it('abre um campo de busca inline ao clicar no ícone (desktop)', async () => {
    renderWithTheme(<EventsFilters {...baseProps} />)
    await userEvent.click(screen.getByRole('button', { name: /abrir busca/i }))
    expect(screen.getByPlaceholderText('Buscar evento...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^buscar$/i })).toBeDisabled()
  })

  it('não aplica a busca enquanto digita e aplica ao clicar em Buscar', async () => {
    const onSearchChange = vi.fn()
    renderWithTheme(<EventsFilters {...baseProps} onSearchChange={onSearchChange} />)

    await userEvent.click(screen.getByRole('button', { name: /abrir busca/i }))
    await userEvent.type(screen.getByPlaceholderText('Buscar evento...'), 'react')

    expect(onSearchChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /^buscar$/i })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }))
    expect(onSearchChange).toHaveBeenCalledWith('react')
  })

  it('fecha a busca inline ao clicar fora do formulário', async () => {
    renderWithTheme(<EventsFilters {...baseProps} />)

    await userEvent.click(screen.getByRole('button', { name: /abrir busca/i }))
    expect(screen.getByPlaceholderText('Buscar evento...')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(screen.queryByPlaceholderText('Buscar evento...')).not.toBeInTheDocument()
  })

  it('não exibe o botão de favoritos quando não há favoritos', () => {
    renderWithTheme(<EventsFilters {...baseProps} />)
    expect(screen.queryByRole('button', { name: /favoritos/i })).not.toBeInTheDocument()
  })

  it('não exibe o botão de favoritos quando há favoritos', () => {
    renderWithTheme(<EventsFilters {...baseProps} favouriteIds={new Set(['1'])} />)
    expect(screen.queryByRole('button', { name: /favoritos/i })).not.toBeInTheDocument()
  })

  it('renderiza o ViewToggle', () => {
    renderWithTheme(<EventsFilters {...baseProps} />)
    expect(screen.getByRole('group', { name: /modo de visualização/i })).toBeInTheDocument()
  })

  it('repassa locationOptions pro FilterModal', async () => {
    renderWithTheme(<EventsFilters {...baseProps} locationOptions={['São Paulo']} />)
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(screen.getByText('São Paulo')).toBeInTheDocument()
  })

  it('chama onSelectLocation ao selecionar um local dentro do FilterModal', async () => {
    const onSelectLocation = vi.fn()
    renderWithTheme(
      <EventsFilters
        {...baseProps}
        locationOptions={['São Paulo']}
        onSelectLocation={onSelectLocation}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    await userEvent.click(screen.getByText('São Paulo'))
    expect(onSelectLocation).toHaveBeenCalledWith('São Paulo')
  })
})
