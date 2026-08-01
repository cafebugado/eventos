'use client'

import { Component } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import RefreshIcon from '@mui/icons-material/Refresh'
import HomeIcon from '@mui/icons-material/Home'
import { captureError } from '../lib/sentry.js'

// Paleta fixa, independente do tema do app — o crash pode ter vindo do
// próprio ThemeProvider, então não confiamos em tokens de tema aqui.
const COLORS = {
  background: '#0f172a',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  danger: '#f87171',
  primary: '#3b82f6',
  surface: '#1e293b',
  border: '#334155',
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    captureError(error, { componentStack: errorInfo?.componentStack })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
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
            Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={this.handleReload}
              startIcon={<RefreshIcon />}
              sx={{
                bgcolor: COLORS.primary,
                color: '#fff',
                '&:hover': { bgcolor: COLORS.primary },
              }}
            >
              Recarregar
            </Button>
            <Button
              onClick={this.handleGoHome}
              startIcon={<HomeIcon />}
              sx={{
                bgcolor: COLORS.surface,
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                '&:hover': { bgcolor: COLORS.surface, borderColor: COLORS.border },
              }}
            >
              Ir para Início
            </Button>
          </Stack>
        </Box>
      )
    }

    return this.props.children
  }
}
