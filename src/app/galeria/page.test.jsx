import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import GalleryPage, { metadata } from './page'
import { getGalleryEvents } from '../../services/galleryService'
import { captureError } from '../../lib/sentry'

vi.mock('../../services/galleryService', () => ({
  getGalleryEvents: vi.fn(),
}))
vi.mock('../../lib/sentry', () => ({
  captureError: vi.fn(),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('GalleryPage', () => {
  beforeEach(() => {
    getGalleryEvents.mockReset()
    captureError.mockReset()
  })

  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/galeria/i)
    expect(metadata.description).toBeTruthy()
  })

  it('renderiza os álbuns reais retornados pela API', async () => {
    getGalleryEvents.mockResolvedValue([
      {
        id: '1',
        eventName: 'Meetup Café Bugado',
        eventDate: '20/02/2026',
        community: 'Café Bugado',
        createdBy: 'Alice',
        photos: [
          {
            id: 'p1',
            url: 'https://example.com/1.png',
            thumb: 'https://example.com/1.png',
            caption: '',
          },
        ],
      },
    ])

    renderWithTheme(await GalleryPage())

    expect(screen.getByText('Meetup Café Bugado')).toBeInTheDocument()
  })

  it('degrada graciosamente e reporta ao Sentry quando a busca de álbuns falha', async () => {
    const error = new Error('falha de rede')
    getGalleryEvents.mockRejectedValue(error)

    renderWithTheme(await GalleryPage())

    expect(screen.getByText(/galeria da/i)).toBeInTheDocument()
    expect(captureError).toHaveBeenCalledWith(error, {
      context: 'GalleryPage.loadGalleryEvents',
    })
  })
})
