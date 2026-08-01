import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Usado nos loading.js de cada rota (convenção do Next.js App Router) —
// equivalente ao PageLoader do app antigo, que aparecia durante o lazy load
// das rotas via React.lazy/Suspense.
export default function PageLoader() {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}
      aria-label="Carregando página"
    >
      <CircularProgress />
    </Box>
  )
}
