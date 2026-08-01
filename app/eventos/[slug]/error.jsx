'use client'

import { useEffect } from 'react'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import { captureError } from '../../../lib/sentry'
import BackToEventsButton from './BackToEventsButton'

// Convenção nativa do App Router: captura erros lançados durante a
// renderização/data-fetching de app/eventos/[slug]/page.jsx (ex.: falha de
// rede/servidor ao buscar o evento — 404 "de verdade" é tratado via
// notFound() na própria page.jsx, não chega aqui). `reset()` tenta
// re-renderizar o segmento sem recarregar a página inteira.
export default function EventDetailsError({ error, reset }) {
  useEffect(() => {
    captureError(error, { context: 'EventDetailsPage.error' })
  }, [error])

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={2} sx={{ mb: 3 }}>
        <BackToEventsButton />
      </Stack>
      <Stack
        spacing={1.5}
        role="alert"
        aria-live="polite"
        sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}
      >
        <ErrorOutlineOutlinedIcon sx={{ fontSize: 48, color: 'error.main' }} />
        <Typography variant="h5" component="h2">
          Erro ao carregar o evento
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Não foi possível carregar os detalhes deste evento. Verifique sua conexão e tente
          novamente.
        </Typography>
        <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => reset()}>
          Tentar novamente
        </Button>
      </Stack>
    </Container>
  )
}
