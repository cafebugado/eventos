import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import GalleryEventCard from './GalleryEventCard'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '1',
  eventName: 'Meetup React',
  eventDate: '20/02/2026',
  community: 'Café Bugado',
  createdBy: 'Alice',
  photos: [
    { id: 'p1', url: 'https://example.com/1.png', caption: '', postedAt: '20/02/2026' },
    { id: 'p2', url: 'https://example.com/2.png', caption: '', postedAt: '21/02/2026' },
  ],
}

describe('GalleryEventCard', () => {
  it('renderiza nome do evento, comunidade e contagem de fotos', () => {
    renderWithTheme(<GalleryEventCard event={event} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('Meetup React')).toBeInTheDocument()
    expect(screen.getByText('Café Bugado')).toBeInTheDocument()
    expect(screen.getByText('2 fotos')).toBeInTheDocument()
  })

  it('chama onPhotoClick com o evento e índice 0 ao clicar', async () => {
    const onPhotoClick = vi.fn()
    renderWithTheme(<GalleryEventCard event={event} onPhotoClick={onPhotoClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onPhotoClick).toHaveBeenCalledWith(event, 0)
  })
})
