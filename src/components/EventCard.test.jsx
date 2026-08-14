import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventCard from './EventCard'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

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
    pushMock.mockClear()
  })

  it('renderiza o nome do evento', () => {
    renderWithTheme(<EventCard event={baseEvent} />)
    expect(screen.getByText('Evento Teste')).toBeInTheDocument()
  })

  it('exibe badge com o período quando não é passado nem hoje', () => {
    renderWithTheme(<EventCard event={baseEvent} />)
    expect(screen.getByText('Noturno')).toBeInTheDocument()
  })

  it('exibe badge Encerrado quando isPast=true', () => {
    renderWithTheme(<EventCard event={baseEvent} isPast />)
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
  })

  it('exibe badge Hoje quando isToday=true', () => {
    renderWithTheme(<EventCard event={baseEvent} isToday />)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
  })

  it('não exibe descrição por padrão (variant compact)', () => {
    renderWithTheme(<EventCard event={baseEvent} />)
    expect(screen.queryByText('Descrição do evento teste')).not.toBeInTheDocument()
  })

  it('exibe descrição quando showDescription=true', () => {
    renderWithTheme(<EventCard event={baseEvent} showDescription />)
    expect(screen.getByText('Descrição do evento teste')).toBeInTheDocument()
  })

  it('não exibe localização quando showLocation=false', () => {
    renderWithTheme(<EventCard event={{ ...baseEvent, modalidade: 'Presencial' }} />)
    expect(screen.queryByText(/São Paulo/)).not.toBeInTheDocument()
  })

  it('exibe localização quando showLocation=true e modalidade não é Online', () => {
    renderWithTheme(<EventCard event={{ ...baseEvent, modalidade: 'Presencial' }} showLocation />)
    expect(screen.getByText('São Paulo - SP')).toBeInTheDocument()
  })

  it('não exibe localização quando modalidade é Online', () => {
    renderWithTheme(<EventCard event={baseEvent} showLocation />)
    expect(screen.queryByText(/São Paulo/)).not.toBeInTheDocument()
  })

  it('exibe botão de ação quando showActionButton=true e variant=full', () => {
    renderWithTheme(<EventCard event={baseEvent} variant="full" showActionButton />)
    expect(screen.getByRole('button', { name: /saber mais/i })).toBeInTheDocument()
  })

  it('exibe link de ação quando showActionButton=true e variant=compact', () => {
    renderWithTheme(<EventCard event={baseEvent} variant="compact" showActionButton />)
    expect(screen.getByRole('link', { name: /saber mais/i })).toBeInTheDocument()
  })

  it('usa actionLabel customizado quando fornecido', () => {
    renderWithTheme(
      <EventCard event={baseEvent} variant="full" showActionButton actionLabel="Participar" />
    )
    expect(screen.getByRole('button', { name: 'Participar' })).toBeInTheDocument()
  })

  it('exibe tags quando fornecidas', () => {
    const tags = [
      { id: 't1', nome: 'React', cor: '#61dafb' },
      { id: 't2', nome: 'Node', cor: '#68a063' },
    ]
    renderWithTheme(<EventCard event={baseEvent} tags={tags} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
  })

  it('navega para /eventos/:id ao clicar', async () => {
    renderWithTheme(<EventCard event={baseEvent} />)
    await userEvent.click(screen.getByRole('button', { name: 'Evento Teste' }))
    expect(pushMock).toHaveBeenCalledWith('/eventos/1')
  })

  it('usa onClick customizado quando fornecido', async () => {
    const handleClick = vi.fn()
    renderWithTheme(<EventCard event={baseEvent} onClick={handleClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Evento Teste' }))
    expect(handleClick).toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('exibe label "Ver detalhes do evento" quando isPast=true', () => {
    renderWithTheme(<EventCard event={baseEvent} variant="full" showActionButton isPast />)
    expect(screen.getByRole('button', { name: /ver detalhes do evento/i })).toBeInTheDocument()
  })

  it('navega com Enter no card', async () => {
    renderWithTheme(<EventCard event={baseEvent} />)
    const card = screen.getByRole('button', { name: 'Evento Teste' })
    card.focus()
    await userEvent.keyboard('{Enter}')
    expect(pushMock).toHaveBeenCalledWith('/eventos/1')
  })
})
