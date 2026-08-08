import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UpcomingEvents from '../components/UpcomingEvents'
import Testimonials from '../components/Testimonials'

export const dynamic = 'force-dynamic'

// Sem fonte de dados: integração com a API removida — eventos em destaque
// voltam quando a nova API for plugada (ver SPRINT.md).
export default function Home() {
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

      <UpcomingEvents events={[]} tagsMap={{}} />
      <Testimonials />
    </>
  )
}
