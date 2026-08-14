import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
  dateFrom: '',
  dateTo: '',
  onDateFrom: vi.fn(),
  onDateTo: vi.fn(),
  onApplyFilters: vi.fn(),
  onClearFilters: vi.fn(),
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

  it('renderiza o seletor de modo de visualização sem o modo Lista', () => {
    renderWithTheme(<EventsFilters {...baseProps} />)
    expect(screen.getByRole('group', { name: /modo de visualização/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lista' })).not.toBeInTheDocument()
  })

  it('não mostra busca nem filtros quando o modo calendário está ativo', () => {
    renderWithTheme(<EventsFilters {...baseProps} viewMode="calendar" />)
    expect(screen.queryByRole('button', { name: /abrir busca/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /filtros/i })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /modo de visualização/i })).toBeInTheDocument()
  })

  it('fecha os filtros abertos ao trocar para calendário', async () => {
    const onChangeViewMode = vi.fn()
    renderWithTheme(
      <EventsFilters
        {...baseProps}
        locationOptions={['São Paulo']}
        onChangeViewMode={onChangeViewMode}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(screen.getByLabelText(/local/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /calendário/i }))

    expect(onChangeViewMode).toHaveBeenCalledWith('calendar')
    expect(screen.queryByLabelText(/local/i)).not.toBeInTheDocument()
  })

  it('abre os filtros em linha no desktop', async () => {
    renderWithTheme(<EventsFilters {...baseProps} locationOptions={['São Paulo']} />)
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/local/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /limpar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /ver resultados/i })).toBeDisabled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('aplica os filtros desktop ao clicar em Ver resultados', async () => {
    const onApplyFilters = vi.fn()
    renderWithTheme(
      <EventsFilters
        {...baseProps}
        locationOptions={['São Paulo']}
        onApplyFilters={onApplyFilters}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    await userEvent.click(screen.getByLabelText(/local/i))
    await userEvent.click(screen.getByRole('option', { name: 'São Paulo' }))
    expect(screen.getByRole('button', { name: /limpar/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /ver resultados/i })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: /ver resultados/i }))
    expect(onApplyFilters).toHaveBeenCalledWith({
      tag: '',
      local: 'São Paulo',
      from: '',
      to: '',
    })
    expect(screen.getByLabelText(/local/i)).toBeInTheDocument()
  })

  it('limpa os filtros desktop e fecha o painel', async () => {
    const onClearFilters = vi.fn()
    renderWithTheme(
      <EventsFilters
        {...baseProps}
        selectedLocation="São Paulo"
        filterActiveCount={1}
        locationOptions={['São Paulo']}
        onClearFilters={onClearFilters}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    await userEvent.click(screen.getByRole('button', { name: /limpar/i }))

    expect(onClearFilters).toHaveBeenCalled()
    expect(screen.queryByLabelText(/local/i)).not.toBeInTheDocument()
  })

  it('fecha os filtros desktop ao clicar fora', async () => {
    renderWithTheme(
      <>
        <button type="button">Fora</button>
        <EventsFilters {...baseProps} locationOptions={['São Paulo']} />
      </>
    )

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(screen.getByLabelText(/local/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Fora' }))
    expect(screen.queryByLabelText(/local/i)).not.toBeInTheDocument()
  })

  it('fecha o menu de seleção ao rolar a página', async () => {
    renderWithTheme(
      <EventsFilters
        {...baseProps}
        tags={[{ id: 1, nome: 'React' }]}
        locationOptions={['São Paulo']}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    await userEvent.click(screen.getByLabelText(/tags/i))
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument()

    fireEvent.scroll(window)
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /tags/i })).toBeInTheDocument()
  })

  it('mantém o modal de filtros no mobile', async () => {
    renderWithTheme(<EventsFilters {...baseProps} isMobile locationOptions={['São Paulo']} />)
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /local/i })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})
