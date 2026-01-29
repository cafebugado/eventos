import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'
import { renderWithRouter } from '../test/utils'
import * as authService from '../services/authService'

// Mock do authService
vi.mock('../services/authService', () => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
}))

// Mock do react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authService.getSession.mockResolvedValue(null)
  })

  it('deve renderizar o formulário de login', () => {
    renderWithRouter(<Login />)

    expect(screen.getByText('Eventos Admin')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('deve redirecionar se já estiver autenticado', async () => {
    authService.getSession.mockResolvedValue({ user: { id: '1' } })

    renderWithRouter(<Login />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard')
    })
  })

  it('deve mostrar erro de validação para email vazio', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
    })
  })

  it('deve aceitar apenas emails válidos no campo de email', () => {
    renderWithRouter(<Login />)

    const emailInput = screen.getByLabelText('Email')

    // O campo tem type="email" que valida formato
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('deve mostrar erro de validação para senha curta', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)

    await user.type(screen.getByLabelText('Email'), 'teste@teste.com')
    await user.type(screen.getByLabelText('Senha'), '123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument()
    })
  })

  it('deve fazer login com credenciais válidas', async () => {
    const user = userEvent.setup()
    authService.signIn.mockResolvedValue({ user: { id: '1' } })

    renderWithRouter(<Login />)

    await user.type(screen.getByLabelText('Email'), 'admin@teste.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith('admin@teste.com', 'senha123')
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard')
    })
  })

  it('deve mostrar erro para credenciais inválidas', async () => {
    const user = userEvent.setup()
    authService.signIn.mockRejectedValue(new Error('Invalid login credentials'))

    renderWithRouter(<Login />)

    await user.type(screen.getByLabelText('Email'), 'admin@teste.com')
    await user.type(screen.getByLabelText('Senha'), 'senhaerrada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Email ou senha incorretos')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro genérico para outros erros', async () => {
    const user = userEvent.setup()
    authService.signIn.mockRejectedValue(new Error('Network error'))

    renderWithRouter(<Login />)

    await user.type(screen.getByLabelText('Email'), 'admin@teste.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('deve alternar visibilidade da senha', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)

    const passwordInput = screen.getByLabelText('Senha')
    const toggleButton = screen.getByRole('button', { name: '' })

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('deve desabilitar botão durante loading', async () => {
    const user = userEvent.setup()
    authService.signIn.mockImplementation(() => new Promise(() => {})) // Promise que nunca resolve

    renderWithRouter(<Login />)

    await user.type(screen.getByLabelText('Email'), 'admin@teste.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Entrando/i })).toBeDisabled()
    })
  })
})
