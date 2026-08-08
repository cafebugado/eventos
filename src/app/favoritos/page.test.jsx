import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import FavoritosPage, { metadata } from './page'
import { getAllEventTags } from '../../services/tagService'

vi.mock('../../services/tagService', () => ({
  getAllEventTags: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('FavoritosPage', () => {
  it('define metadata de título, descrição e noindex', () => {
    expect(metadata.title).toMatch(/favoritos/i)
    expect(metadata.description).toBeTruthy()
    expect(metadata.robots).toEqual({ index: false, follow: true })
  })

  it('busca o mapa de tags no servidor e renderiza a página', async () => {
    getAllEventTags.mockResolvedValue({})

    const ui = await FavoritosPage()
    renderWithTheme(ui)

    expect(screen.getByRole('heading', { name: /meus favoritos/i })).toBeInTheDocument()
  })

  it('não quebra a página quando a busca de tags falha', async () => {
    getAllEventTags.mockRejectedValue(new Error('falha de rede'))

    const ui = await FavoritosPage()
    renderWithTheme(ui)

    expect(screen.getByRole('heading', { name: /meus favoritos/i })).toBeInTheDocument()
  })
})
