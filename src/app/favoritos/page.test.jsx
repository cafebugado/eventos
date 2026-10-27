import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import FavoritosPage, { metadata, revalidate } from './page'
import { PAGE_REVALIDATE } from '../../constants/revalidate'
import { getEventsTagsMap } from '../../services/eventService'

vi.mock('../../services/eventService', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getEventsTagsMap: vi.fn(),
  }
})
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

  it('declara a janela de revalidação (ISR) definida em PAGE_REVALIDATE', () => {
    expect(revalidate).toBe(PAGE_REVALIDATE.FAVOURITES)
  })

  it('define metadata de título, descrição e noindex', () => {
    expect(metadata.title).toMatch(/favoritos/i)
    expect(metadata.description).toBeTruthy()
    expect(metadata.robots).toEqual({ index: false, follow: true })
  })

  it('renderiza a página sem embutir o mapa de tags completo no servidor', async () => {
    const ui = await FavoritosPage()
    renderWithTheme(ui)

    expect(screen.getByRole('heading', { name: /meus favoritos/i })).toBeInTheDocument()
    expect(getEventsTagsMap).not.toHaveBeenCalled()
  })
})
