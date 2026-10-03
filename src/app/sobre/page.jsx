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

// ISR: servida do cache da CDN e regenerada no máximo a cada 600s — não voltar
// pra force-dynamic, que roda a função a cada visita (ver issue #376).
// O valor precisa ser literal (exigência do Next) e igual a PAGE_REVALIDATE.ABOUT em
// constants/revalidate.js — o page.test.jsx falha se divergirem (ver issue #400).
export const revalidate = 600

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
