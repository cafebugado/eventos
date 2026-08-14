import Container from '@mui/material/Container'
import AboutFeatures from '../../components/AboutFeatures'
import ContributorsGrid from '../../components/ContributorsGrid'
import { captureError } from '../../lib/sentry'
import { getContributors, getEventStats } from '../../services/eventService'

export const metadata = {
  title: 'Sobre | Eventos Café Bugado',
  description:
    'Conheça a Comunidade Café Bugado. Um jeito mais simples de descobrir eventos de tecnologia. Reunimos meetups, workshops, hackathons e conferências em um só lugar.',
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [contributorsResult, statsResult] = await Promise.allSettled([
    getContributors(),
    getEventStats(),
  ])

  if (contributorsResult.status === 'rejected') {
    captureError(contributorsResult.reason, { context: 'AboutPage.loadContributors' })
  }
  if (statsResult.status === 'rejected') {
    captureError(statsResult.reason, { context: 'AboutPage.loadEventStats' })
  }

  const contributors = contributorsResult.status === 'fulfilled' ? contributorsResult.value : []
  const totalEventos = statsResult.status === 'fulfilled' ? statsResult.value.totalEventos : null

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <AboutFeatures totalEventos={totalEventos} />
      <ContributorsGrid contributors={contributors} />
    </Container>
  )
}
