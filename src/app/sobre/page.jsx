import Container from '@mui/material/Container'
import AboutFeatures from '../../components/AboutFeatures'
import ContributorsGrid from '../../components/ContributorsGrid'

export const metadata = {
  title: 'Sobre | Eventos Café Bugado',
  description:
    'Conheça a Comunidade Café Bugado. Um jeito mais simples de descobrir eventos de tecnologia. Reunimos meetups, workshops, hackathons e conferências em um só lugar.',
}

export const dynamic = 'force-dynamic'

// Sem fonte de dados: integração com a API removida — estatísticas e
// contribuintes voltam quando a nova API for plugada (ver SPRINT.md).
export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <AboutFeatures totalEventos={null} />
      <ContributorsGrid contributors={[]} />
    </Container>
  )
}
