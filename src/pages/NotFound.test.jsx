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
    expect(screen.getByText('Pagina nao encontrada')).toBeInTheDocument()
    expect(
      screen.getByText('A pagina que voce esta procurando nao existe ou foi movida.')
    ).toBeInTheDocument()
  })

  it('deve renderizar os botões de navegação', () => {
    renderWithRouter(<NotFound />)

    expect(screen.getByRole('button', { name: /Voltar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ir para Inicio/i })).toBeInTheDocument()
  })

  it('deve voltar para página anterior ao clicar em Voltar', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NotFound />)

    await user.click(screen.getByRole('button', { name: /Voltar/i }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('deve navegar para home ao clicar em Ir para Inicio', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NotFound />)

    await user.click(screen.getByRole('button', { name: /Ir para Inicio/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
