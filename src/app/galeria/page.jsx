import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'

export const metadata = {
  title: 'Galeria | Eventos Café Bugado',
  description:
    'Galeria de fotos das comunidades e eventos presenciais do Café Bugado. Veja os melhores momentos de cada encontro.',
}

export const dynamic = 'force-dynamic'

// Sem fonte de dados: aguardando GET /gallery/albums/public (Sprint 5 da API
// dedicada), bloqueado em GRANT manual de auth.* no Supabase — ver
// D:\backendeventos-public-api\SPRINT.md.
export default function GalleryPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Galeria da{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            Comunidade
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: 'auto', fontSize: '1.05rem' }}
        >
          Cada foto conta uma história. Aqui, pessoas de comunidades como{' '}
          <Box component="strong">Café Bugado</Box>, <Box component="strong">Meet Up Tech SP</Box> e
          muitas outras registram e compartilham os melhores momentos dos eventos presenciais que
          viveram juntas. Sua comunidade também pode fazer parte disso.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
        <PhotoLibraryOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Typography variant="body1" color="text.secondary">
          Erro ao carregar a galeria. Tente novamente mais tarde.
        </Typography>
      </Stack>
    </Container>
  )
}
