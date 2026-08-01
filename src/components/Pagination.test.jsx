import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Pagination from './Pagination'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('Pagination', () => {
  it('não renderiza nada quando há 1 página ou menos', () => {
    const { container } = renderWithTheme(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza a navegação quando há mais de 1 página', () => {
    renderWithTheme(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'Paginação de eventos' })).toBeInTheDocument()
  })

  it('marca a página atual', () => {
    renderWithTheme(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('chama onPageChange com o número da página clicada', async () => {
    const onPageChange = vi.fn()
    renderWithTheme(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Go to page 3' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
