import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from './ErrorBoundary'

function Boom() {
  throw new Error('boom')
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renderiza os filhos normalmente quando não há erro', () => {
    render(
      <ErrorBoundary>
        <p>conteúdo normal</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('conteúdo normal')).toBeInTheDocument()
  })

  it('mostra a UI de fallback quando um filho lança um erro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
  })

  it('recarrega a página ao clicar em Recarregar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const locationMock = { href: '', reload: vi.fn() }
    vi.stubGlobal('location', locationMock)

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Recarregar' }))

    expect(locationMock.reload).toHaveBeenCalledTimes(1)
  })

  it('volta para o início ao clicar em Ir para Início', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const locationMock = { href: '', reload: vi.fn() }
    vi.stubGlobal('location', locationMock)

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ir para Início' }))

    expect(locationMock.href).toBe('/')
  })
})
