import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GalleryEventCard from './GalleryEventCard'

const makePhotos = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    url: `https://example.com/foto-${i + 1}.jpg`,
    thumb: `https://example.com/foto-${i + 1}.jpg`,
    caption: `Foto ${i + 1}`,
    postedBy: null,
    postedAt: `0${i + 1}/01/2024`,
  }))

const baseEvent = {
  id: '1',
  eventName: 'DevFest Goiânia 2024',
  eventDate: '15/11/2024',
  community: 'Cafe Bugado',
  createdBy: 'Dario Reis',
  photos: makePhotos(5),
}

describe('GalleryEventCard', () => {
  it('deve renderizar o nome do evento', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('DevFest Goiânia 2024')).toBeInTheDocument()
  })

  it('deve renderizar a data do evento', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('15/11/2024')).toBeInTheDocument()
  })

  it('deve renderizar o nome da comunidade', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
  })

  it('deve exibir a contagem correta de fotos', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('5 fotos')).toBeInTheDocument()
  })

  it('deve exibir "1 foto" no singular quando há apenas uma foto', () => {
    const event = { ...baseEvent, photos: makePhotos(1) }
    render(<GalleryEventCard event={event} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('1 foto')).toBeInTheDocument()
  })

  it('deve exibir a imagem de capa com a url da primeira foto', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    const img = screen.getByAltText('Foto 1')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/foto-1.jpg')
  })

  it('deve usar o nome do evento como alt quando a foto não tem legenda', () => {
    const event = {
      ...baseEvent,
      photos: [{ ...baseEvent.photos[0], caption: '' }, ...baseEvent.photos.slice(1)],
    }
    render(<GalleryEventCard event={event} onPhotoClick={vi.fn()} />)
    expect(screen.getByAltText('DevFest Goiânia 2024')).toBeInTheDocument()
  })

  it('deve exibir o nome do criador do álbum no footer', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('Dario Reis')).toBeInTheDocument()
    expect(screen.getByText(/postado por/i)).toBeInTheDocument()
  })

  it('deve exibir "Desconhecido" quando não há criador', () => {
    const event = { ...baseEvent, createdBy: null }
    render(<GalleryEventCard event={event} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('Desconhecido')).toBeInTheDocument()
  })

  it('deve exibir a data da última foto no footer', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('05/01/2024')).toBeInTheDocument()
  })

  it('deve chamar onPhotoClick ao clicar no card', async () => {
    const user = userEvent.setup()
    const onPhotoClick = vi.fn()
    render(<GalleryEventCard event={baseEvent} onPhotoClick={onPhotoClick} />)

    await user.click(screen.getByRole('article'))

    expect(onPhotoClick).toHaveBeenCalledWith(baseEvent, 0)
  })

  it('deve renderizar o card como article', () => {
    const { container } = render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(container.querySelector('article.gec-card')).toBeInTheDocument()
  })
})
