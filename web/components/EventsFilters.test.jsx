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
  showOnlyFavourites: false,
  onToggleFavourites: vi.fn(),
  favouriteIds: new Set(),
  viewMode: 'grid',
  onChangeViewMode: vi.fn(),
  tags: [],
  isMobile: false,
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
  })

  it('não exibe o botão de favoritos quando não há favoritos', () => {
    renderWithTheme(<EventsFilters {...baseProps} />)
    expect(screen.queryByRole('button', { name: /favoritos/i })).not.toBeInTheDocument()
  })

  it('exibe o botão de favoritos quando há favoritos (desktop)', () => {
    renderWithTheme(<EventsFilters {...baseProps} favouriteIds={new Set(['1'])} />)
    expect(screen.getByRole('button', { name: /favoritos/i })).toBeInTheDocument()
  })

  it('renderiza o ViewToggle', () => {
    renderWithTheme(<EventsFilters {...baseProps} />)
    expect(screen.getByRole('group', { name: /modo de visualização/i })).toBeInTheDocument()
  })
})
