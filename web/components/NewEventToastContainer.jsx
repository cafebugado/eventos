'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import { useRealtimeEvents } from '../hooks/useRealtimeEvents'

const MAX_TOASTS = 3
const AUTO_DISMISS_MS = 8000
const FALLBACK_IMAGE = '/eventos.png'

function ToastItem({ toast, onDismiss }) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(100)
  const [imgSrc, setImgSrc] = useState(toast.imagem || FALLBACK_IMAGE)

  const dismiss = useCallback(() => setVisible(false), [])

  useEffect(() => {
    const stepMs = 100
    const stepPercent = (stepMs / AUTO_DISMISS_MS) * 100
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.max(0, prev - stepPercent)
        if (next === 0) {
          clearInterval(interval)
          dismiss()
        }
        return next
      })
    }, stepMs)
    return () => clearInterval(interval)
  }, [dismiss])

  return (
    <Slide direction="left" in={visible} onExited={onDismiss}>
      <Paper
        elevation={6}
        role="alert"
        aria-live="polite"
        sx={{
          position: 'relative',
          width: 320,
          maxWidth: '100%',
          overflow: 'hidden',
          borderLeft: 3,
          borderColor: 'primary.main',
          pointerEvents: 'auto',
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 1, px: 1.5 }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <AutoAwesomeOutlinedIcon color="primary" sx={{ fontSize: 13 }} />
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}
            >
              Novo evento
            </Typography>
          </Stack>
          <IconButton size="small" aria-label="Fechar notificação" onClick={dismiss}>
            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', px: 1.5, py: 1 }}>
          <Box
            component="img"
            src={imgSrc}
            alt={toast.nome}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {toast.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {toast.data_evento}
              {toast.horario ? ` · ${toast.horario}` : ''}
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="contained"
          startIcon={<EventAvailableOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => {
            router.push(`/eventos/${toast.slug || toast.id}`)
            dismiss()
          }}
          sx={{ ml: 1.5, mb: 1.5, fontSize: 12 }}
        >
          Ver evento
        </Button>

        <LinearProgress variant="determinate" value={progress} sx={{ height: 2 }} />
      </Paper>
    </Slide>
  )
}

// Equivalente ao NewEventToastContainer do app antigo — escuta eventos novos
// publicados em tempo real (Supabase Realtime) e empilha até 3 notificações
// no canto inferior direito, cada uma some sozinha depois de 8s.
export default function NewEventToastContainer() {
  const [toasts, setToasts] = useState([])
  const idCounter = useRef(0)

  const addToast = useCallback((event) => {
    idCounter.current += 1
    setToasts((prev) =>
      [{ ...event, _toastId: `${event.id}-${idCounter.current}` }, ...prev].slice(0, MAX_TOASTS)
    )
  }, [])

  const dismiss = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t._toastId !== toastId))
  }, [])

  useRealtimeEvents(addToast)

  if (toasts.length === 0) {
    return null
  }

  return (
    <Stack
      spacing={1}
      aria-label="Notificações de novos eventos"
      sx={{
        position: 'fixed',
        // No mobile o MobileNav (SpeedDial) ocupa o mesmo canto — sobe o
        // offset pra não sobrepor o FAB.
        bottom: { xs: 96, sm: 24 },
        right: { xs: 16, sm: 24 },
        left: { xs: 16, sm: 'auto' },
        zIndex: (theme) => theme.zIndex.snackbar,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t._toastId} toast={t} onDismiss={() => dismiss(t._toastId)} />
      ))}
    </Stack>
  )
}
