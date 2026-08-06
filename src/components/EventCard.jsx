'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { darken } from '@mui/material/styles'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import PodcastsOutlinedIcon from '@mui/icons-material/PodcastsOutlined'
import RichText from './RichText'
import { FavouriteEventButton } from './FavouriteEventButton'
import { useEventCountdown } from '../hooks/useEventCountdown'
import { vivoVioleta } from '../theme/tokens/vivoVioleta'
import { formatDateToDayMonth } from '../utils/eventDate'

const FALLBACK_IMAGE = '/eventos.png'

function ModalidadeIcon({ modalidade, fontSize }) {
  if (modalidade === 'Online') {
    return <WifiOutlinedIcon fontSize={fontSize} />
  }
  if (modalidade === 'Híbrido') {
    return <VideocamOutlinedIcon fontSize={fontSize} />
  }
  return <DesktopWindowsOutlinedIcon fontSize={fontSize} />
}

function InfoRow({ icon, children }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      {icon}
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </Stack>
  )
}

export default function EventCard({
  event,
  tags = [],
  variant = 'compact',
  isPast = false,
  isToday = false,
  showDescription = false,
  showLocation = false,
  showActionButton = false,
  showInfoRows = true,
  showDateBadge = false,
  actionInternal = false,
  actionLabel,
  onClick,
  style,
  favouriteIds = new Set(),
  toggleFavourite,
}) {
  const router = useRouter()
  const isFull = variant === 'full'
  const iconFontSize = isFull ? 'small' : 'inherit'

  const handleClick = onClick ?? (() => router.push(`/eventos/${event.slug || event.id}`))

  const { isHappening, isWithin24h, countdown } = useEventCountdown(
    event.data_evento,
    event.horario
  )

  // Calculado só no client (useEffect) em vez de direto no render: Date.now()
  // é impuro e, em SSR, poderia divergir entre servidor e cliente e causar
  // um mismatch de hidratação. O setState roda num callback (setTimeout),
  // não sincronamente no corpo do effect, para não encadear um re-render
  // síncrono durante o commit.
  const [isNew, setIsNew] = useState(false)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsNew(
        !!event.created_at &&
          Date.now() - new Date(event.created_at).getTime() < 48 * 60 * 60 * 1000
      )
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [event.created_at])

  // Estado em vez de mutar e.target.src direto no onError: se a imagem
  // falhasse uma vez (request abortada, hiccup passageiro do CDN), o fallback
  // ficava colado pra sempre — o React nunca reaplicaria o src original
  // porque a prop event.imagem não muda. Com estado, reseta se o evento mudar.
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => {
    const timeoutId = setTimeout(() => setImageFailed(false), 0)
    return () => clearTimeout(timeoutId)
  }, [event.imagem])

  const badgeText = isPast
    ? 'Encerrado'
    : isHappening
      ? 'Acontecendo agora'
      : isToday
        ? 'Hoje'
        : showDateBadge
          ? formatDateToDayMonth(event.data_evento)
          : event.periodo
  const badgeColor = isPast ? 'default' : isHappening ? 'success' : 'primary'

  const defaultActionLabel = isPast ? 'Ver detalhes do evento' : 'Saber mais sobre o evento'
  const showLegacyLocation = showLocation && event.cidade && event.modalidade !== 'Online'

  return (
    <Card
      component="div"
      role="button"
      tabIndex={0}
      aria-label={event.nome}
      onClick={handleClick}
      onKeyDown={(event_) => event_.key === 'Enter' && handleClick()}
      style={style}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        opacity: isPast ? 0.6 : 1,
        filter: isPast ? 'grayscale(100%)' : 'none',
        border: '1px solid',
        borderColor: isNew && !isPast ? 'success.main' : 'divider',
        transition: (theme) => theme.transitions.create(['transform', 'box-shadow']),
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={imageFailed || !event.imagem ? FALLBACK_IMAGE : event.imagem}
          alt={event.nome}
          loading="lazy"
          onError={() => setImageFailed(true)}
          sx={{ height: isFull ? 200 : 160, objectFit: 'cover' }}
        />

        {!isWithin24h && !isHappening && (
          <Chip
            label={badgeText}
            color={badgeColor}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}

        {isNew && !isPast && (
          <Chip
            label="Novo"
            color="success"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}

        {tags.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            useFlexGap
            sx={{ position: 'absolute', bottom: 8, left: 8, right: 8, flexWrap: 'wrap' }}
          >
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.nome}
                size="small"
                sx={{
                  bgcolor: darken(tag.cor || vivoVioleta['500'], 0.15),
                  color: 'common.white',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                }}
              />
            ))}
          </Stack>
        )}

        {isHappening && (
          <Chip
            icon={<PodcastsOutlinedIcon />}
            label="Acontecendo agora!"
            color="success"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}

        {!isHappening && isWithin24h && countdown && (
          <Chip
            icon={<TimerOutlinedIcon />}
            label={`Começa em ${countdown}`}
            color="primary"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1.5 }}>
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: isFull ? 3 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.nome}
          </Typography>

          {showDescription && event.descricao && (
            <RichText
              content={event.descricao}
              stopPropagationOnLinks
              sx={{
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.875rem',
                opacity: 0.7,
              }}
            />
          )}
        </Box>

        {showInfoRows && (
          <Stack spacing={0.5} sx={{ mt: isFull ? 0 : 'auto' }}>
            <InfoRow icon={<CalendarMonthOutlinedIcon fontSize={iconFontSize} />}>
              {event.data_evento}
            </InfoRow>
            <InfoRow icon={<AccessTimeOutlinedIcon fontSize={iconFontSize} />}>
              {event.horario}
            </InfoRow>
            <InfoRow icon={<DateRangeOutlinedIcon fontSize={iconFontSize} />}>
              {event.dia_semana}
            </InfoRow>
            {event.modalidade && (
              <InfoRow
                icon={<ModalidadeIcon modalidade={event.modalidade} fontSize={iconFontSize} />}
              >
                {event.modalidade}
              </InfoRow>
            )}
            {showLegacyLocation && (
              <InfoRow icon={<LocationOnOutlinedIcon fontSize={iconFontSize} />}>
                {[event.cidade, event.estado].filter(Boolean).join(' - ')}
              </InfoRow>
            )}
          </Stack>
        )}

        {showActionButton && (
          <Stack
            direction="row"
            spacing={2.5}
            useFlexGap
            sx={{
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              mt: !showInfoRows && !isFull ? 'auto' : undefined,
            }}
          >
            {isFull || actionInternal ? (
              <Button
                variant="contained"
                size={isFull ? undefined : 'small'}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                {actionLabel ?? defaultActionLabel}
              </Button>
            ) : (
              <Button
                component="a"
                href={isPast ? undefined : event.link}
                target="_blank"
                rel="noopener noreferrer"
                disabled={isPast}
                variant="contained"
                size="small"
                endIcon={!isPast && <ArrowOutwardOutlinedIcon fontSize="small" />}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isPast) {
                    e.preventDefault()
                  }
                }}
              >
                {actionLabel ?? defaultActionLabel}
              </Button>
            )}
            <FavouriteEventButton
              event={event}
              isFavourite={favouriteIds.has(event.id)}
              onToggle={toggleFavourite}
              isCard
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
