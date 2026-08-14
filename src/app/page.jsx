import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UpcomingEvents from '../components/UpcomingEvents'
import Testimonials from '../components/Testimonials'
import { getEventsTagsMap, getFeaturedEvents } from '../services/eventService'
import { captureError } from '../lib/sentry'

export const dynamic = 'force-dynamic'

async function loadFeaturedEvents() {
  try {
    return await getFeaturedEvents()
  } catch (error) {
    captureError(error, { context: 'Home.loadFeaturedEvents' })
    return []
  }
}

// getEventsTagsMap falhando não deve derrubar os destaques da home — só os
// chips de tag ficam indisponíveis (degradação graciosa).
async function loadEventsTagsMap() {
  try {
    return await getEventsTagsMap()
  } catch (error) {
    captureError(error, { context: 'Home.loadEventsTagsMap' })
    return {}
  }
}

export default async function Home() {
  const [events, tagsMap] = await Promise.all([loadFeaturedEvents(), loadEventsTagsMap()])

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
