'use client'

import { useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined'
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'

// Exceção intencional ao sistema de Modal compartilhado (ver CLAUDE.md):
// lightbox em tela cheia com z-index própria, fora do fluxo do Dialog do MUI.
export default function GalleryPhotoModal({ event, photoIndex, onClose, onPrev, onNext, onGoTo }) {
  const photo = event?.photos[photoIndex]
  const hasPrev = photoIndex > 0
  const hasNext = photoIndex < event?.photos.length - 1

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev()
      }
      if (e.key === 'ArrowRight' && hasNext) {
        onNext()
      }
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!photo) {
    return null
  }

  return (
    <Box
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto: ${photo.caption}`}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 3 },
      }}
    >
      <Stack
        onClick={(e) => e.stopPropagation()}
        spacing={2}
        sx={{ width: '100%', maxWidth: 960, maxHeight: '100%' }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'common.white' }}>
            <PhotoLibraryOutlinedIcon fontSize="small" />
            <Typography variant="body2">{event.eventName}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {photoIndex + 1} / {event.photos.length}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} aria-label="Fechar" sx={{ color: 'common.white' }}>
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <IconButton
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Foto anterior"
            sx={{ color: 'common.white' }}
          >
            <ChevronLeftOutlinedIcon fontSize="large" />
          </IconButton>

          <Box
            component="img"
            key={photo.id}
            src={photo.url}
            alt={photo.caption}
            sx={{
              maxWidth: '100%',
              maxHeight: { xs: '50vh', sm: '65vh' },
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />

          <IconButton
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Próxima foto"
            sx={{ color: 'common.white' }}
          >
            <ChevronRightOutlinedIcon fontSize="large" />
          </IconButton>
        </Stack>

        <Stack spacing={0.5} sx={{ color: 'common.white', textAlign: 'center' }}>
          {photo.caption && <Typography variant="body2">{photo.caption}</Typography>}
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {photo.postedBy && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', opacity: 0.8 }}>
                <PersonOutlineOutlinedIcon fontSize="small" />
                <Typography variant="caption">Postado por {photo.postedBy}</Typography>
              </Stack>
            )}
            {photo.postedAt && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', opacity: 0.8 }}>
                <CalendarMonthOutlinedIcon fontSize="small" />
                <Typography variant="caption">{photo.postedAt}</Typography>
              </Stack>
            )}
          </Stack>
        </Stack>

        {event.photos.length > 1 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'center', overflowX: 'auto', py: 1 }}
          >
            {event.photos.map((p, idx) => (
              <Box
                key={p.id}
                component="button"
                onClick={() => onGoTo(idx)}
                aria-label={`Ir para foto ${idx + 1}`}
                sx={{
                  p: 0,
                  border: '2px solid',
                  borderColor: idx === photoIndex ? 'primary.main' : 'transparent',
                  borderRadius: 1,
                  cursor: 'pointer',
                  flexShrink: 0,
                  bgcolor: 'transparent',
                }}
              >
                <Box
                  component="img"
                  src={p.thumb}
                  alt={p.caption}
                  sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 0.5 }}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
