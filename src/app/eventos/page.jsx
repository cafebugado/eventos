import EventsPageClient from './EventsPageClient'

export const metadata = {
  title: 'Próximos Eventos | Eventos Café Bugado',
  description:
    'Confira os próximos eventos de tecnologia. Meetups, workshops, hackathons e conferências indicados pela comunidade Café Bugado.',
}

export const dynamic = 'force-dynamic'

// Sem fonte de dados: integração com a API removida — a listagem volta a
// carregar eventos quando a nova API for plugada (ver SPRINT.md).
export default function EventsPage() {
  return (
    <EventsPageClient
      events={[]}
      tagsMap={{}}
      tags={[]}
      error={new Error('Busca de eventos indisponível: integração com a API removida.')}
    />
  )
}
