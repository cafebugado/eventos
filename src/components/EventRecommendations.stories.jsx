import Box from '@mui/material/Box'
import EventRecommendations from './EventRecommendations'

export default {
  title: 'Design System/EventRecommendations',
  component: EventRecommendations,
  parameters: {
    nextjs: { navigation: { pathname: '/eventos/meetup-cafe-bugado' } },
  },
}

const currentEvent = { id: '1', nome: 'Meetup Café Bugado' }

const recommended = [
  {
    id: '2',
    slug: 'workshop-react-avancado',
    nome: 'Workshop React Avançado',
    data_evento: '15/03/2026',
    horario: '19:00',
    imagem: null,
  },
  {
    id: '3',
    slug: 'hackathon-cafe-bugado',
    nome: 'Hackathon Café Bugado',
    data_evento: '20/03/2026',
    horario: '09:00',
    imagem: null,
  },
  {
    id: '4',
    slug: 'meetup-nodejs',
    nome: 'Meetup Node.js',
    data_evento: '25/03/2026',
    horario: '19:30',
    imagem: null,
  },
]

// Sem addon de MSW no Storybook — cada story stuba window.fetch via `loaders`
// (roda antes do render dessa story) pra não depender da API real.
function mockFetchJson(body) {
  return async function loader() {
    window.fetch = async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    return {}
  }
}

export const ComResultados = {
  render: () => (
    <Box sx={{ maxWidth: 1100 }}>
      <EventRecommendations currentEvent={currentEvent} />
    </Box>
  ),
  loaders: [mockFetchJson(recommended)],
}

export const Vazio = {
  render: () => (
    <Box sx={{ maxWidth: 1100 }}>
      <EventRecommendations currentEvent={currentEvent} />
    </Box>
  ),
  loaders: [mockFetchJson([])],
}
