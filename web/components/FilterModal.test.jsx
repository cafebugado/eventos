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
  showPastEvents: false,
  onTogglePast: vi.fn(),
  dateFrom: '',
  dateTo: '',
  onDateFrom: vi.fn(),
  onDateTo: vi.fn(),
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

  it('chama onTogglePast ao clicar no switch de eventos passados', async () => {
    const onTogglePast = vi.fn()
    renderWithTheme(<FilterModal {...baseProps} onTogglePast={onTogglePast} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onTogglePast).toHaveBeenCalled()
  })

  it('não exibe "Limpar filtros" quando não há filtros ativos', () => {
    renderWithTheme(<FilterModal {...baseProps} />)
    expect(screen.queryByText(/limpar filtros/i)).not.toBeInTheDocument()
  })

  it('exibe "Limpar filtros" com contagem quando há filtros ativos', () => {
    renderWithTheme(<FilterModal {...baseProps} selectedTagId="1" showPastEvents />)
    expect(screen.getByText(/limpar filtros \(2\)/i)).toBeInTheDocument()
  })
})
