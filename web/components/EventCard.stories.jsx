import Box from '@mui/material/Box'
import EventCard from './EventCard'

export default {
  title: 'Design System/EventCard',
  component: EventCard,
  parameters: {
    nextjs: { navigation: { pathname: '/eventos' } },
  },
}

const baseEvent = {
  id: '1',
  slug: 'meetup-cafe-bugado',
  nome: 'Meetup Café Bugado — Edição de Março',
  descricao:
    'Um encontro mensal da comunidade tech, com talks, networking e muito café. Venha participar!',
  data_evento: '10/03/2026',
  horario: '19:00',
  dia_semana: 'Terça-feira',
  periodo: 'Noturno',
  modalidade: 'Online',
  link: 'https://cafebugado.com.br',
  imagem: null,
  cidade: 'São Paulo',
  estado: 'SP',
}

const tags = [
  { id: 't1', nome: 'React', cor: '#61dafb' },
  { id: 't2', nome: 'Node.js', cor: '#68a063' },
]

function Wrapper({ children, width = 340 }) {
  return <Box sx={{ width }}>{children}</Box>
}

export const Compacto = {
  render: () => (
    <Wrapper>
      <EventCard event={baseEvent} tags={tags} />
    </Wrapper>
  ),
}

export const Completo = {
  render: () => (
    <Wrapper width={420}>
      <EventCard
        event={baseEvent}
        tags={tags}
        variant="full"
        showDescription
        showActionButton
        showLocation
      />
    </Wrapper>
  ),
}

export const Hoje = {
  render: () => (
    <Wrapper>
      <EventCard event={baseEvent} tags={tags} isToday />
    </Wrapper>
  ),
}

export const Encerrado = {
  render: () => (
    <Wrapper width={420}>
      <EventCard event={baseEvent} tags={tags} variant="full" showActionButton isPast />
    </Wrapper>
  ),
}

export const Presencial = {
  render: () => (
    <Wrapper width={420}>
      <EventCard
        event={{ ...baseEvent, modalidade: 'Presencial' }}
        tags={tags}
        variant="full"
        showLocation
      />
    </Wrapper>
  ),
}
