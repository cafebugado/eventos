import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import { createClient } from '../../lib/supabase/server'
import { getAlbuns, normalizeAlbum } from '../../services/galeriaService'
import { captureError } from '../../lib/sentry'
import GalleryPageClient from './GalleryPageClient'

export const metadata = {
  title: 'Galeria | Eventos Café Bugado',
  description:
    'Galeria de fotos das comunidades e eventos presenciais do Café Bugado. Veja os melhores momentos de cada encontro.',
}

// Server Component: busca e normaliza os álbuns direto no servidor — sem
// hook client-side (useGallery.js) nem loading state. O app antigo também
// expunha busca por texto/comunidade via useGallery, mas a página nunca
// renderizava nenhum controle de filtro para isso (capacidade morta) — não
// portamos essa parte não utilizada.
async function loadAlbums() {
  const supabase = await createClient()
  try {
    const albums = await getAlbuns(supabase)
    return albums.filter((a) => (a.galeria_fotos || []).length > 0).map(normalizeAlbum)
  } catch (error) {
    captureError(error, { context: 'GalleryPage.loadAlbums' })
    return null
  }
}

export default async function GalleryPage() {
  const events = await loadAlbums()
  const hasError = events === null
  const items = events ?? []

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

      {hasError && (
        <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
          <PhotoLibraryOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="body1" color="text.secondary">
            Erro ao carregar a galeria. Tente novamente mais tarde.
          </Typography>
        </Stack>
      )}

      {!hasError && items.length === 0 && (
        <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
          <PhotoLibraryOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="body1" color="text.secondary">
            Nenhum evento encontrado na galeria ainda.
          </Typography>
        </Stack>
      )}

      {!hasError && items.length > 0 && <GalleryPageClient events={items} />}
    </Container>
  )
}
