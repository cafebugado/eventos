'use client'

import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import RefreshIcon from '@mui/icons-material/Refresh'
import { captureError } from '../lib/sentry.js'

// Convenção do Next.js App Router: substitui o layout inteiro (inclusive
// <html>/<body>) quando um erro escapa até a raiz — a última rede de
// segurança, complementar aos error.jsx por rota. Ver
// https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error

// Paleta fixa, independente do tema do app — o crash pode ter vindo do
// próprio ThemeProvider, então não confiamos em tokens de tema aqui.
const COLORS = {
  background: '#0f172a',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  danger: '#f87171',
  primary: '#3b82f6',
}

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    captureError(error, { context: 'global-error' })
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 4,
            textAlign: 'center',
            bgcolor: COLORS.background,
            color: COLORS.text,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, color: COLORS.danger, fontWeight: 700 }}>
            Algo deu errado
          </Typography>
          <Typography sx={{ mb: 4, color: COLORS.textMuted, maxWidth: 500 }}>
            Ocorreu um erro inesperado. Tente novamente em instantes.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={reset}
              startIcon={<RefreshIcon />}
              sx={{
                bgcolor: COLORS.primary,
                color: '#fff',
                '&:hover': { bgcolor: COLORS.primary },
              }}
            >
              Tentar novamente
            </Button>
          </Stack>
        </Box>
      </body>
    </html>
  )
}
