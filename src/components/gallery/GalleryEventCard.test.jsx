import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GalleryEventCard from './GalleryEventCard'

const makePhotos = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    thumb: `https://example.com/thumb-${i + 1}.jpg`,
    caption: `Foto ${i + 1}`,
    postedBy: `Usuario ${i + 1}`,
    postedAt: `0${i + 1}/01/2024`,
  }))

const baseEvent = {
  id: '1',
  eventName: 'DevFest Goiânia 2024',
  eventDate: '15/11/2024',
  community: 'MEET_UP_TECH_SP',
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
    expect(screen.getByText('MEET_UP_TECH_SP')).toBeInTheDocument()
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

  it('deve renderizar no máximo 4 miniaturas de fotos', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    const thumbs = screen.getAllByRole('button', { name: /ver foto/i })
    expect(thumbs).toHaveLength(4)
  })

  it('deve exibir overlay "+N" quando há mais de 4 fotos', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('não deve exibir overlay quando há 4 fotos ou menos', () => {
    const event = { ...baseEvent, photos: makePhotos(4) }
    render(<GalleryEventCard event={event} onPhotoClick={vi.fn()} />)
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument()
  })

  it('deve exibir o overlay correto para múltiplas fotos extras', () => {
    const event = { ...baseEvent, photos: makePhotos(10) }
    render(<GalleryEventCard event={event} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('+6')).toBeInTheDocument()
  })

  it('deve renderizar todas as imagens das miniaturas com alt correto', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByAltText('Foto 1')).toBeInTheDocument()
    expect(screen.getByAltText('Foto 2')).toBeInTheDocument()
    expect(screen.getByAltText('Foto 3')).toBeInTheDocument()
    expect(screen.getByAltText('Foto 4')).toBeInTheDocument()
  })

  it('deve exibir o nome do autor da última postagem no footer', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByText('Usuario 5')).toBeInTheDocument()
    expect(screen.getByText(/última postagem por/i)).toBeInTheDocument()
  })

  it('deve chamar onPhotoClick com o evento e índice correto ao clicar na miniatura', async () => {
    const user = userEvent.setup()
    const onPhotoClick = vi.fn()
    render(<GalleryEventCard event={baseEvent} onPhotoClick={onPhotoClick} />)

    const thumbs = screen.getAllByRole('button', { name: /ver foto/i })
    await user.click(thumbs[0])

    expect(onPhotoClick).toHaveBeenCalledWith(baseEvent, 0)
  })

  it('deve chamar onPhotoClick com índice correto para cada miniatura', async () => {
    const user = userEvent.setup()
    const onPhotoClick = vi.fn()
    render(<GalleryEventCard event={baseEvent} onPhotoClick={onPhotoClick} />)

    const thumbs = screen.getAllByRole('button', { name: /ver foto/i })
    await user.click(thumbs[2])

    expect(onPhotoClick).toHaveBeenCalledWith(baseEvent, 2)
  })

  it('deve ter aria-label descritivo em cada miniatura', () => {
    render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Ver foto: Foto 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver foto: Foto 2' })).toBeInTheDocument()
  })

  it('deve renderizar o card como article', () => {
    const { container } = render(<GalleryEventCard event={baseEvent} onPhotoClick={vi.fn()} />)
    expect(container.querySelector('article.gec-card')).toBeInTheDocument()
  })

  it('deve exibir somente 1 miniatura quando o evento tem 1 foto', () => {
    const event = { ...baseEvent, photos: makePhotos(1) }
    render(<GalleryEventCard event={event} onPhotoClick={vi.fn()} />)
    const thumbs = screen.getAllByRole('button', { name: /ver foto/i })
    expect(thumbs).toHaveLength(1)
  })
})
