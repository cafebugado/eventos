import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from './Home'
import { renderWithRouter } from '../test/utils'

// Mock do react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('deve renderizar o conteúdo principal', () => {
    renderWithRouter(<Home />)

    expect(screen.getAllByRole('heading', { name: 'Eventos' }).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Comunidade Cafe Bugado').length).toBeGreaterThan(0)
    expect(screen.getByText(/Eventos de/)).toBeInTheDocument()
    expect(screen.getAllByText('Tecnologia').length).toBeGreaterThan(0)
  })

  it('deve renderizar as features', () => {
    renderWithRouter(<Home />)

    expect(screen.getByText('Meetups & Workshops')).toBeInTheDocument()
    expect(screen.getByText('Hackathons')).toBeInTheDocument()
    expect(screen.getByText('Conferencias')).toBeInTheDocument()
  })

  it('deve renderizar a caixa informativa', () => {
    renderWithRouter(<Home />)

    expect(screen.getByText(/Como funciona:/)).toBeInTheDocument()
    expect(screen.getByText(/Reunimos eventos de diversas comunidades/)).toBeInTheDocument()
  })

  it('deve navegar para /eventos ao clicar no botão CTA', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Home />)

    await user.click(screen.getByRole('button', { name: /Ver Eventos/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/eventos')
  })

  it('deve alternar tema de claro para escuro', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Home />)

    const themeButton = screen.getByRole('button', { name: 'Alternar tema' })

    await user.click(themeButton)

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  it('deve alternar tema de escuro para claro', async () => {
    localStorage.getItem.mockReturnValue('dark')

    const user = userEvent.setup()
    renderWithRouter(<Home />)

    const themeButton = screen.getByRole('button', { name: 'Alternar tema' })

    await user.click(themeButton)

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    })
  })

  it('deve carregar tema salvo do localStorage', async () => {
    localStorage.getItem.mockReturnValue('dark')

    renderWithRouter(<Home />)

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  it('deve usar tema claro por padrão', () => {
    localStorage.getItem.mockReturnValue(null)
    renderWithRouter(<Home />)

    // Tema claro é quando não há atributo data-theme ou ele é vazio
    const dataTheme = document.documentElement.getAttribute('data-theme')
    expect(dataTheme === null || dataTheme === '').toBe(true)
  })

  it('deve renderizar o footer com ano atual', () => {
    renderWithRouter(<Home />)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
    expect(screen.getByText(/Feito com/)).toBeInTheDocument()
  })

  it('deve ter link externo para cafebugado.com.br', () => {
    renderWithRouter(<Home />)

    const links = screen.getAllByRole('link', { name: /Comunidade Cafe Bugado/i })
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', 'https://cafebugado.com.br')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
