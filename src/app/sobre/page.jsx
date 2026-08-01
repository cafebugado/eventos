import Container from '@mui/material/Container'
import { getEventStats } from '../../services/eventService'
import { getContributors } from '../../services/contributorService'
import { captureError } from '../../lib/sentry'
import AboutFeatures from '../../components/AboutFeatures'
import ContributorsGrid from '../../components/ContributorsGrid'

export const metadata = {
  title: 'Sobre | Eventos Café Bugado',
  description:
    'Conheça a Comunidade Café Bugado. Um jeito mais simples de descobrir eventos de tecnologia. Reunimos meetups, workshops, hackathons e conferências em um só lugar.',
}

// Força renderização dinâmica — ver comentário em app/page.jsx.
export const dynamic = 'force-dynamic'

// Server Component: busca estatísticas de eventos e contribuintes direto no
// servidor — cada busca falha isoladamente (uma não derruba a outra).
async function loadAboutData() {
  const [statsResult, contributorsResult] = await Promise.allSettled([
    getEventStats(),
    getContributors(),
  ])

  if (statsResult.status === 'rejected') {
    captureError(statsResult.reason, { context: 'AboutPage.getEventStats' })
  }
  if (contributorsResult.status === 'rejected') {
    captureError(contributorsResult.reason, { context: 'AboutPage.getContributors' })
  }

  return {
    totalEventos: statsResult.status === 'fulfilled' ? statsResult.value.total_publicados : null,
    contributors: contributorsResult.status === 'fulfilled' ? contributorsResult.value : [],
  }
}

export default async function AboutPage() {
  const { totalEventos, contributors } = await loadAboutData()

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <AboutFeatures totalEventos={totalEventos} />
      <ContributorsGrid contributors={contributors} />
    </Container>
  )
}
