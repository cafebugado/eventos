import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotFound from './NotFound'
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

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a página 404', () => {
    renderWithRouter(<NotFound />)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(
      screen.getByText('A página que você está procurando não existe ou foi movida.')
    ).toBeInTheDocument()
  })

  it('deve renderizar os botões de navegação', () => {
    renderWithRouter(<NotFound />)

    expect(screen.getByRole('button', { name: /Voltar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ir para Início/i })).toBeInTheDocument()
  })

  it('deve voltar para página anterior ao clicar em Voltar', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NotFound />)

    await user.click(screen.getByRole('button', { name: /Voltar/i }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('deve navegar para home ao clicar em Ir para Início', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NotFound />)

    await user.click(screen.getByRole('button', { name: /Ir para Início/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
