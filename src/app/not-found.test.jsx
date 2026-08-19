import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import NotFound from './not-found'

const backMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: backMock }),
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('NotFound', () => {
  it('renderiza o código 404 e a mensagem', () => {
    renderWithTheme(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /página não encontrada/i })).toBeInTheDocument()
  })

  it('chama router.back() ao clicar em Voltar', async () => {
    renderWithTheme(<NotFound />)
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(backMock).toHaveBeenCalled()
  })

  it('link "Ir para Início" aponta para "/"', () => {
    renderWithTheme(<NotFound />)
    expect(screen.getByRole('link', { name: /ir para início/i })).toHaveAttribute('href', '/')
  })
})
