import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'

// Componente estático — sem hooks/estado, renderiza no servidor quando usado
// dentro de um Server Component (ver app/eventos/[slug]/page.jsx).
export default function EventLocation({ endereco, cidade, estado, modalidade }) {
  if (modalidade === 'Online' || (!endereco && !cidade)) {
    return null
  }

  const locationParts = [endereco, cidade, estado].filter(Boolean)
  const mapsQuery = encodeURIComponent(locationParts.join(', '))

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        p: 2,
        my: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <LocationOnOutlinedIcon color="primary" />
        <Stack spacing={0}>
          {endereco && <Typography variant="body2">{endereco}</Typography>}
          {(cidade || estado) && (
            <Typography variant="body2" color="text.secondary">
              {[cidade, estado].filter(Boolean).join(' - ')}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Button
        component="a"
        href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        startIcon={<LocationOnOutlinedIcon fontSize="small" />}
      >
        Ver no Google Maps
      </Button>
    </Stack>
  )
}
