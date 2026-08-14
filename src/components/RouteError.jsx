'use client'

import { useEffect } from 'react'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import { captureError } from '../lib/sentry'

// Usado pelos error.jsx de cada rota (convenção do Next.js App Router) —
// captura erros lançados durante a renderização/data-fetching do segmento.
// eventos/[slug]/error.jsx tem sua própria versão (com botão de voltar
// específico) e não usa este componente.
export default function RouteError({ error, reset, context, message }) {
  useEffect(() => {
    captureError(error, { context })
  }, [error, context])

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack
        spacing={1.5}
        role="alert"
        aria-live="polite"
        sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}
      >
        <ErrorOutlineOutlinedIcon sx={{ fontSize: 48, color: 'error.main' }} />
        <Typography variant="h5" component="h2">
          Algo deu errado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => reset()}>
          Tentar novamente
        </Button>
      </Stack>
    </Container>
  )
}
