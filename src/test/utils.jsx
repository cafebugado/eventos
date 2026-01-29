import { render } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'

// Wrapper padrão com BrowserRouter
export function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route)

  return {
    ...render(ui, { wrapper: BrowserRouter }),
  }
}

// Wrapper com MemoryRouter para testes de navegação
export function renderWithMemoryRouter(ui, { initialEntries = ['/'] } = {}) {
  return {
    ...render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>),
  }
}

// Mock de evento com dados completos
export function createMockEvent(overrides = {}) {
  return {
    id: '1',
    nome: 'Evento Teste',
    descricao: 'Descrição do evento teste',
    data_evento: '2024-02-15',
    horario: '19:00',
    dia_semana: 'Quinta-feira',
    periodo: 'Noturno',
    link: 'https://evento.com',
    imagem: 'https://exemplo.com/imagem.jpg',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// Mock de usuário autenticado
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'admin@teste.com',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// Mock de sessão
export function createMockSession(overrides = {}) {
  return {
    user: createMockUser(),
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() + 3600000,
    ...overrides,
  }
}

// Helper para aguardar elemento
export async function waitForElement(callback, options = {}) {
  const { timeout = 1000, interval = 50 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const result = callback()
      if (result) {
        return result
      }
    } catch {
      // Elemento ainda não encontrado
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  throw new Error('Timeout waiting for element')
}
