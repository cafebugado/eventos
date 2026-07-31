import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h3" component="h1" color="primary">
          Eventos Café Bugado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Base do novo frontend em Next.js + Material UI + Zustand. Scaffold da Fase 0 da migração.
        </Typography>
        <Button variant="contained" color="primary" sx={{ alignSelf: 'flex-start' }}>
          Ver eventos
        </Button>
      </Stack>
    </Container>
  )
}
