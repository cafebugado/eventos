import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AboutPage, { metadata } from './page'
import { getEventStats } from '../../services/eventService'
import { getContributors } from '../../services/contributorService'

vi.mock('../../services/eventService', () => ({
  getEventStats: vi.fn(),
}))
vi.mock('../../services/contributorService', () => ({
  getContributors: vi.fn(),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('AboutPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/sobre/i)
    expect(metadata.description).toBeTruthy()
  })

  it('renderiza estatísticas e contribuintes buscados no servidor', async () => {
    getEventStats.mockResolvedValue({ total_publicados: 25 })
    getContributors.mockResolvedValue([
      { id: '1', nome: 'Alice', avatar_url: '', github_url: 'https://github.com/alice' },
    ])

    const ui = await AboutPage()
    renderWithTheme(ui)

    expect(screen.getByText(/eventos cadastrados/i)).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('não quebra a página quando as buscas falham', async () => {
    getEventStats.mockRejectedValue(new Error('falha'))
    getContributors.mockRejectedValue(new Error('falha'))

    const ui = await AboutPage()
    renderWithTheme(ui)

    expect(screen.getByText('Nenhum contribuinte cadastrado ainda.')).toBeInTheDocument()
  })
})
