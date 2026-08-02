import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getUpcomingEvents } from '../services/eventService'
import { getAllEventTags } from '../services/tagService'
import { captureError } from '../lib/sentry'
import UpcomingEvents from '../components/UpcomingEvents'
import Testimonials from '../components/Testimonials'

// Força renderização dinâmica: a API é chamada com cache: 'no-store' (dado
// sempre atual) em toda página. Sem isso, o `next build` tenta pré-renderizar
// estaticamente, detecta o fetch não-cacheável e aborta via uma exceção
// interna do Next — que cairia no catch abaixo e seria reportada ao Sentry
// como erro real, poluindo o build. Declarar aqui evita a tentativa.
export const dynamic = 'force-dynamic'

// Server Component: busca eventos + tags direto no servidor (sem estado de
// loading client-side) — substitui o useUpcomingEvents/useEffect do app antigo.
async function loadUpcomingEvents() {
  try {
    const events = await getUpcomingEvents(3)
    // getAllEventTags degrada pra vazio em vez de derrubar a página inteira
    // — tags são complementares (chips), a listagem de eventos não depende.
    const tagsMap =
      events.length > 0
        ? await getAllEventTags().catch((error) => {
            captureError(error, { context: 'Home.loadUpcomingEvents.tagsMap' })
            return {}
          })
        : {}
    return { events, tagsMap }
  } catch (error) {
    captureError(error, { context: 'Home.loadUpcomingEvents' })
    return { events: [], tagsMap: {} }
  }
}

export default async function Home() {
  const { events, tagsMap } = await loadUpcomingEvents()

  return (
    <>
      <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Encontre eventos de{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                tecnologia
              </Box>{' '}
              em um só lugar
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.1rem', textAlign: 'justify' }}
            >
              Descubra meetups, workshops, hackathons e conferências organizados por comunidades e
              empresas. Encontre eventos para aprender, conhecer pessoas da área, compartilhar
              experiências e acompanhar o que está acontecendo no mercado de tecnologia.
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.1rem', textAlign: 'justify' }}
            >
              Comunidades e empresas indicam seus eventos, e nós organizamos as principais
              informações para facilitar sua busca. Assim, você encontra diferentes eventos em um só
              lugar e escolhe aqueles que mais combinam com seus interesses. A organização e a
              realização de cada evento são de responsabilidade de seus respectivos organizadores.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <UpcomingEvents events={events} tagsMap={tagsMap} />
      <Testimonials />
    </>
  )
}
