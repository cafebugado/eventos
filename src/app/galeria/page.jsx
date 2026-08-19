import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import GalleryPageClient from './GalleryPageClient'
import { getGalleryEvents } from '../../services/galleryService'
import { captureError } from '../../lib/sentry'

export const metadata = {
  title: 'Galeria | Eventos Café Bugado',
  description:
    'Galeria de fotos das comunidades e eventos presenciais do Café Bugado. Veja os melhores momentos de cada encontro.',
}

export const dynamic = 'force-dynamic'

async function loadGalleryEvents() {
  try {
    return await getGalleryEvents()
  } catch (error) {
    captureError(error, { context: 'GalleryPage.loadGalleryEvents' })
    return []
  }
}

export default async function GalleryPage() {
  const events = await loadGalleryEvents()

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={4} sx={{ mb: 5, alignItems: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: '1.85rem', md: '2.25rem' }, textAlign: 'center' }}
        >
          Galeria da{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            Comunidade
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.05rem', maxWidth: 760, width: '100%', textAlign: 'justify' }}
        >
          Cada foto conta uma história. Aqui, pessoas de comunidades como{' '}
          <Box component="strong">Café Bugado</Box>, <Box component="strong">Meet Up Tech SP</Box> e
          muitas outras registram e compartilham os melhores momentos dos eventos presenciais que
          viveram juntas. Sua comunidade também pode fazer parte disso.
        </Typography>
      </Stack>

      <GalleryPageClient events={events} />
    </Container>
  )
}
