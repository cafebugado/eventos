import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined'
import TagOutlinedIcon from '@mui/icons-material/TagOutlined'
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
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
              Eventos de{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                tecnologia
              </Box>{' '}
              em um só lugar
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Este é um espaço feito por e para a comunidade. Reunimos eventos de tecnologia criados
              por comunidades e empresas para facilitar o acesso de quem quer aprender, trocar ideia
              e conhecer pessoas da área. Aqui você encontra oportunidades para participar,
              contribuir e crescer junto com outras pessoas que vivem tecnologia no dia a dia.
            </Typography>

            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }} useFlexGap>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CodeOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2">Meetups e Workshops</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <DataObjectOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2">Hackathons</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TagOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2">Conferências</Typography>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                alignItems: 'flex-start',
              }}
            >
              <InfoOutlinedIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" component="p">
                  Como funciona
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A comunidade indica eventos e nós reunimos tudo em um só lugar. Os eventos são
                  organizados por terceiros. Nosso papel é ajudar na divulgação e facilitar a
                  descoberta para que ninguém fique de fora.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <UpcomingEvents events={events} tagsMap={tagsMap} />
      <Testimonials />
    </>
  )
}
