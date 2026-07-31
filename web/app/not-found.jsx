'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'

// Convenção nativa do App Router: substitui NotFound.jsx + a rota catch-all
// do react-router. Renderizado automaticamente para qualquer URL sem rota
// correspondente, e também quando notFound() é chamado a partir de uma
// página (ex.: app/eventos/[slug]/page.jsx quando o evento não existe).
export default function NotFound() {
  const router = useRouter()

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <SearchOffOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: '3.5rem', md: '5rem' }, fontWeight: 700, color: 'primary.main' }}
        >
          404
        </Typography>
        <Typography variant="h5" component="h2">
          Página não encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
            Voltar
          </Button>
          <Button variant="contained" component={Link} href="/" startIcon={<HomeOutlinedIcon />}>
            Ir para Início
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}
