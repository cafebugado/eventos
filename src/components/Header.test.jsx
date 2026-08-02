import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme/theme'
import { vivoVioleta } from '../theme/tokens/vivoVioleta'
import Header from './Header'

const { usePathnameMock } = vi.hoisted(() => ({ usePathnameMock: vi.fn(() => '/') }))

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('Header', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/')
  })

  it('renderiza todos os itens de navegação', () => {
    renderWithTheme(<Header />)
    const nav = screen.getByRole('navigation')
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Eventos' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Sobre' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Galeria' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Contato' })).toBeInTheDocument()
  })

  it('marca a rota atual como ativa', () => {
    usePathnameMock.mockReturnValue('/eventos')
    renderWithTheme(<Header />)
    const nav = screen.getByRole('navigation')
    expect(within(nav).getByRole('link', { name: 'Eventos' })).toHaveStyle({
      color: vivoVioleta['500'],
    })
  })

  it('alterna o ícone de tema ao clicar no switch', async () => {
    renderWithTheme(<Header />)
    const toggle = screen.getByRole('switch', { name: 'Alternar tema' })

    expect(screen.getByTestId('LightModeOutlinedIcon')).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(toggle)

    expect(await screen.findByTestId('DarkModeOutlinedIcon')).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
