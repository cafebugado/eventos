import Container from '@mui/material/Container'
import AboutFeatures from '../../components/AboutFeatures'
import ContributorsGrid from '../../components/ContributorsGrid'
import { captureError } from '../../lib/sentry'
import { getContributors } from '../../services/eventService'

export const metadata = {
  title: 'Sobre | Eventos Café Bugado',
  description:
    'Conheça a Comunidade Café Bugado. Um jeito mais simples de descobrir eventos de tecnologia. Reunimos meetups, workshops, hackathons e conferências em um só lugar.',
}

export const dynamic = 'force-dynamic'

// Estatísticas (AboutFeatures totalEventos) continuam sem fonte de dados —
// depende de GET /events/stats/public, fora do escopo desta mudança.
export default async function AboutPage() {
  let contributors = []
  try {
    contributors = await getContributors()
  } catch (error) {
    captureError(error, { context: 'AboutPage.loadContributors' })
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <AboutFeatures totalEventos={null} />
      <ContributorsGrid contributors={contributors} />
    </Container>
  )
}
