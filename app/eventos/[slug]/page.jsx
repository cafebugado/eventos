import { notFound } from 'next/navigation'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { darken } from '@mui/material/styles'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined'
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import { createClient } from '../../../lib/supabase/server'
import { getEventBySlugOrId } from '../../../services/eventService'
import { getEventTags } from '../../../services/tagService'
import { captureError } from '../../../lib/sentry'
import { isEventPast } from '../../../utils/eventDate'
import { stripRichText } from '../../../utils/richText'
import RichText from '../../../components/RichText'
import EventLocation from '../../../components/EventLocation'
import EventRecommendations from '../../../components/EventRecommendations'
import BackToEventsButton from './BackToEventsButton'
import EventActions from './EventActions'

const FALLBACK_IMAGE = '/eventos.png'
const SITE_NAME = 'Eventos Café Bugado'
const DEFAULT_DESCRIPTION =
  'Descubra os melhores eventos de tecnologia. Meetups, workshops, hackathons e conferências reunidos em um só lugar pela comunidade.'

function truncateText(text, maxLength = 160) {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}

// PGRST116 (single() sem resultado) e "Event not found" (fallback interno de
// getEventBySlugOrId para slug que não é slug nem UUID válido) são os únicos
// casos que viram 404 — qualquer outro erro (rede, servidor) propaga para o
// error.jsx desta rota.
async function loadEvent(slug) {
  const supabase = await createClient()
  try {
    const event = await getEventBySlugOrId(supabase, slug)
    const eventTags = await getEventTags(supabase, event.id).catch(() => [])
    return { event, eventTags }
  } catch (error) {
    if (error?.code === 'PGRST116') {
      return { event: null, eventTags: [] }
    }
    captureError(error, { context: 'EventDetails.loadEvent', slug })
    throw error
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { event } = await loadEvent(slug)

  if (!event) {
    return { title: `Evento não encontrado | ${SITE_NAME}` }
  }

  const description = truncateText(stripRichText(event.descricao)) || DEFAULT_DESCRIPTION
  const image = event.imagem || FALLBACK_IMAGE
  const canonicalPath = `/eventos/${event.slug || event.id}`

  return {
    title: `${event.nome} | ${SITE_NAME}`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: event.nome,
      description,
      url: canonicalPath,
      type: 'article',
      publishedTime: event.created_at,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.nome,
      description,
      images: [image],
    },
  }
}

function ModalidadeIcon({ modalidade }) {
  if (modalidade === 'Online') {
    return <WifiOutlinedIcon color="primary" />
  }
  if (modalidade === 'Híbrido') {
    return <VideocamOutlinedIcon color="primary" />
  }
  return <DesktopWindowsOutlinedIcon color="primary" />
}

function InfoCard({ icon, label, value }) {
  if (!value) {
    return null
  }
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        p: 1.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {icon}
      <Stack spacing={0}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default async function EventDetailsPage({ params }) {
  const { slug } = await params
  const { event, eventTags } = await loadEvent(slug)

  if (!event) {
    notFound()
  }

  const isPast = isEventPast(event.data_evento)
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://eventos.cafebugado.com.br'}/eventos/${event.slug || event.id}`

  return (
    <>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <BackToEventsButton />

        <Card variant="outlined" sx={{ mt: 3, overflow: 'hidden', opacity: isPast ? 0.85 : 1 }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              image={event.imagem || FALLBACK_IMAGE}
              alt={event.nome}
              sx={{ height: { xs: 220, md: 360 }, objectFit: 'cover' }}
            />
            <Chip
              label={isPast ? 'Encerrado' : event.periodo}
              color={isPast ? 'default' : 'primary'}
              sx={{ position: 'absolute', top: 12, right: 12 }}
            />
            {eventTags.length > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                useFlexGap
                sx={{ position: 'absolute', bottom: 12, left: 12, right: 12, flexWrap: 'wrap' }}
              >
                {eventTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.nome}
                    size="small"
                    sx={{
                      bgcolor: darken(tag.cor || '#2563eb', 0.15),
                      color: '#fff',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}
            >
              {event.nome}
            </Typography>

            {event.descricao && (
              <Box sx={{ mt: 2 }}>
                <RichText content={event.descricao} />
              </Box>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                gap: 1.5,
                my: 3,
              }}
            >
              <InfoCard
                icon={<CalendarMonthOutlinedIcon color="primary" />}
                label="Data"
                value={event.data_evento}
              />
              <InfoCard
                icon={<AccessTimeOutlinedIcon color="primary" />}
                label="Horário"
                value={event.horario}
              />
              <InfoCard
                icon={<DateRangeOutlinedIcon color="primary" />}
                label="Dia da Semana"
                value={event.dia_semana}
              />
              {event.modalidade && (
                <InfoCard
                  icon={<ModalidadeIcon modalidade={event.modalidade} />}
                  label="Modalidade"
                  value={event.modalidade}
                />
              )}
            </Box>

            <EventLocation
              endereco={event.endereco}
              cidade={event.cidade}
              estado={event.estado}
              modalidade={event.modalidade}
            />

            <EventActions event={event} isPast={isPast} shareUrl={shareUrl} />
          </CardContent>
        </Card>
      </Container>

      <EventRecommendations currentEvent={event} currentEventTags={eventTags} />
    </>
  )
}
