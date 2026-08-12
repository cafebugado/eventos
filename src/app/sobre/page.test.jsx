import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AboutPage, { metadata } from './page'
import { getContributors, getEventStats } from '../../services/eventService'
import { captureError } from '../../lib/sentry'

vi.mock('../../services/eventService', () => ({
  getContributors: vi.fn(),
  getEventStats: vi.fn(),
}))
vi.mock('../../lib/sentry', () => ({
  captureError: vi.fn(),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('AboutPage', () => {
  beforeEach(() => {
    getContributors.mockReset().mockResolvedValue([])
    getEventStats.mockReset().mockResolvedValue({ totalEventos: 0 })
    captureError.mockReset()
  })

  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/sobre/i)
    expect(metadata.description).toBeTruthy()
  })

  it('renderiza os contribuintes reais retornados pela API', async () => {
    getContributors.mockResolvedValue([
      {
        id: '1',
        nome: 'Alice',
        avatar_url: 'https://example.com/a.png',
        github_url: 'https://github.com/alice',
        linkedin_url: null,
        portfolio_url: null,
      },
    ])

    renderWithTheme(await AboutPage())

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Nenhum contribuinte cadastrado ainda.')).not.toBeInTheDocument()
  })

  it('renderiza o estado vazio quando não há contribuintes cadastrados', async () => {
    getContributors.mockResolvedValue([])

    renderWithTheme(await AboutPage())

    expect(screen.getByText('Nenhum contribuinte cadastrado ainda.')).toBeInTheDocument()
  })

  it('degrada graciosamente e reporta ao Sentry quando a busca de contribuintes falha', async () => {
    const error = new Error('falha de rede')
    getContributors.mockRejectedValue(error)

    renderWithTheme(await AboutPage())

    expect(screen.getByText('Nenhum contribuinte cadastrado ainda.')).toBeInTheDocument()
    expect(captureError).toHaveBeenCalledWith(error, {
      context: 'AboutPage.loadContributors',
    })
  })

  it('renderiza o contador de eventos cadastrados quando a API responde', async () => {
    getEventStats.mockResolvedValue({ totalEventos: 128 })

    renderWithTheme(await AboutPage())

    expect(screen.getByText(/eventos cadastrados/i)).toBeInTheDocument()
  })

  it('degrada graciosamente e reporta ao Sentry quando a busca de estatísticas falha', async () => {
    const error = new Error('falha de rede')
    getEventStats.mockRejectedValue(error)

    renderWithTheme(await AboutPage())

    expect(
      screen.queryByText('Eventos cadastrados na plataforma pela comunidade')
    ).not.toBeInTheDocument()
    expect(captureError).toHaveBeenCalledWith(error, {
      context: 'AboutPage.loadEventStats',
    })
  })

  it('uma falha na busca de estatísticas não impede a renderização dos contribuintes', async () => {
    getContributors.mockResolvedValue([
      {
        id: '1',
        nome: 'Alice',
        avatar_url: 'https://example.com/a.png',
        github_url: 'https://github.com/alice',
        linkedin_url: null,
        portfolio_url: null,
      },
    ])
    getEventStats.mockRejectedValue(new Error('falha de rede'))

    renderWithTheme(await AboutPage())

    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
