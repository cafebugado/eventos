import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventCard from './EventCard'
import { renderWithRouter } from '../test/utils'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../assets/eventos.png', () => ({ default: 'mock-bg.png' }))
vi.mock('./RichText', () => ({
  default: ({ content, className }) => <div className={className}>{content}</div>,
}))

const baseEvent = {
  id: '1',
  nome: 'Evento Teste',
  descricao: 'Descrição do evento teste',
  data_evento: '20/02/2026',
  horario: '19:00',
  dia_semana: 'Sexta-feira',
  periodo: 'Noturno',
  modalidade: 'Online',
  link: 'https://evento.com',
  imagem: null,
  cidade: 'São Paulo',
  estado: 'SP',
}

describe('EventCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('deve renderizar o nome do evento', () => {
    renderWithRouter(<EventCard event={baseEvent} />)
    expect(screen.getByText('Evento Teste')).toBeInTheDocument()
  })

  it('deve exibir badge com o período quando não é passado nem hoje', () => {
    renderWithRouter(<EventCard event={baseEvent} />)
    expect(screen.getByText('Noturno')).toBeInTheDocument()
  })

  it('deve exibir badge Encerrado quando isPast=true', () => {
    renderWithRouter(<EventCard event={baseEvent} isPast />)
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
  })

  it('deve exibir badge Hoje quando isToday=true', () => {
    renderWithRouter(<EventCard event={baseEvent} isToday />)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
  })

  it('não deve exibir descrição por padrão (variant compact)', () => {
    renderWithRouter(<EventCard event={baseEvent} />)
    expect(screen.queryByText('Descrição do evento teste')).not.toBeInTheDocument()
  })

  it('deve exibir descrição quando showDescription=true', () => {
    renderWithRouter(<EventCard event={baseEvent} showDescription />)
    expect(screen.getByText('Descrição do evento teste')).toBeInTheDocument()
  })

  it('não deve exibir localização quando showLocation=false', () => {
    renderWithRouter(<EventCard event={{ ...baseEvent, modalidade: 'Presencial' }} />)
    expect(screen.queryByText(/São Paulo/)).not.toBeInTheDocument()
  })

  it('deve exibir localização quando showLocation=true e modalidade não é Online', () => {
    renderWithRouter(<EventCard event={{ ...baseEvent, modalidade: 'Presencial' }} showLocation />)
    expect(screen.getByText('São Paulo - SP')).toBeInTheDocument()
  })

  it('não deve exibir localização quando modalidade é Online', () => {
    renderWithRouter(<EventCard event={baseEvent} showLocation />)
    expect(screen.queryByText(/São Paulo/)).not.toBeInTheDocument()
  })

  it('deve exibir botão de ação quando showActionButton=true e variant=full', () => {
    renderWithRouter(<EventCard event={baseEvent} variant="full" showActionButton />)
    // o card também tem role="button", por isso filtramos pela classe específica
    const btn = document.querySelector('button.event-link')
    expect(btn).toBeInTheDocument()
    expect(btn.textContent).toMatch(/saber mais/i)
  })

  it('deve exibir link de ação quando showActionButton=true e variant=compact', () => {
    renderWithRouter(<EventCard event={baseEvent} variant="compact" showActionButton />)
    expect(screen.getByRole('link', { name: /saber mais/i })).toBeInTheDocument()
  })

  it('deve usar actionLabel customizado quando fornecido', () => {
    renderWithRouter(
      <EventCard event={baseEvent} variant="full" showActionButton actionLabel="Participar" />
    )
    const btn = document.querySelector('button.event-link')
    expect(btn).toBeInTheDocument()
    expect(btn.textContent).toMatch(/participar/i)
  })

  it('deve exibir tags quando fornecidas', () => {
    const tags = [
      { id: 't1', nome: 'React', cor: '#61dafb' },
      { id: 't2', nome: 'Node', cor: '#68a063' },
    ]
    renderWithRouter(<EventCard event={baseEvent} tags={tags} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
  })

  it('deve navegar para /eventos/:id ao clicar', async () => {
    const user = userEvent.setup()
    renderWithRouter(<EventCard event={baseEvent} />)
    await user.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/eventos/1')
  })

  it('deve usar onClick customizado quando fornecido', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    renderWithRouter(<EventCard event={baseEvent} onClick={handleClick} />)
    // clica no card (div com role=button)
    const cards = screen.getAllByRole('button')
    await user.click(cards[0])
    expect(handleClick).toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('deve aplicar classe ec-card--past quando isPast=true', () => {
    renderWithRouter(<EventCard event={baseEvent} isPast />)
    const card = screen.getByRole('button')
    expect(card.className).toContain('ec-card--past')
  })

  it('deve exibir label "Ver detalhes do evento" quando isPast=true', () => {
    renderWithRouter(<EventCard event={baseEvent} variant="full" showActionButton isPast />)
    const btn = document.querySelector('button.event-link')
    expect(btn).toBeInTheDocument()
    expect(btn.textContent).toMatch(/ver detalhes/i)
  })

  it('deve navegar com Enter no card', async () => {
    const user = userEvent.setup()
    renderWithRouter(<EventCard event={baseEvent} />)
    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard('{Enter}')
    expect(mockNavigate).toHaveBeenCalledWith('/eventos/1')
  })
})
