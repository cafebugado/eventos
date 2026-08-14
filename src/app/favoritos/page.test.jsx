import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import FavoritosPage, { metadata } from './page'
import { getEventsTagsMap } from '../../services/eventService'

vi.mock('../../services/eventService', () => ({
  getEventsTagsMap: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('FavoritosPage', () => {
  beforeEach(() => {
    getEventsTagsMap.mockReset().mockResolvedValue({})
  })

  it('define metadata de título, descrição e noindex', () => {
    expect(metadata.title).toMatch(/favoritos/i)
    expect(metadata.description).toBeTruthy()
    expect(metadata.robots).toEqual({ index: false, follow: true })
  })

  it('renderiza a página buscando o mapa de tags real no servidor', async () => {
    const ui = await FavoritosPage()
    renderWithTheme(ui)

    expect(screen.getByRole('heading', { name: /meus favoritos/i })).toBeInTheDocument()
    expect(getEventsTagsMap).toHaveBeenCalled()
  })

  it('não quebra a página quando a busca do mapa de tags falha (degradação graciosa)', async () => {
    getEventsTagsMap.mockRejectedValue(new Error('falha ao buscar tags-map'))

    const ui = await FavoritosPage()
    renderWithTheme(ui)

    expect(screen.getByRole('heading', { name: /meus favoritos/i })).toBeInTheDocument()
  })
})
