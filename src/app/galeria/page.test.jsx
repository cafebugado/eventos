import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import GalleryPage, { metadata } from './page'
import { getAlbuns } from '../../services/galeriaService'

vi.mock('../../services/galeriaService', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getAlbuns: vi.fn() }
})

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const rawAlbum = {
  id: 'album-1',
  evento_nome: 'Meetup React',
  evento_data: '20/02/2026',
  comunidade_nome: 'Café Bugado',
  created_by_nome: null,
  fotos: [
    { id: 'p1', url: 'https://example.com/1.png', legenda: '', ordem: 0, created_at: '2026-02-20' },
  ],
}

describe('GalleryPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/galeria/i)
    expect(metadata.description).toBeTruthy()
  })

  it('renderiza os álbuns com fotos buscados no servidor', async () => {
    getAlbuns.mockResolvedValue([rawAlbum])

    const ui = await GalleryPage()
    renderWithTheme(ui)

    expect(screen.getByText('Meetup React')).toBeInTheDocument()
  })

  it('filtra álbuns sem fotos', async () => {
    getAlbuns.mockResolvedValue([{ ...rawAlbum, fotos: [] }])

    const ui = await GalleryPage()
    renderWithTheme(ui)

    expect(screen.getByText('Nenhum evento encontrado na galeria ainda.')).toBeInTheDocument()
  })

  it('exibe estado de erro quando a busca falha', async () => {
    getAlbuns.mockRejectedValue(new Error('falha'))

    const ui = await GalleryPage()
    renderWithTheme(ui)

    expect(screen.getByText(/erro ao carregar a galeria/i)).toBeInTheDocument()
  })
})
