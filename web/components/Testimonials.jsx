import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import StarIcon from '@mui/icons-material/Star'

// Componente estático (sem estado/interatividade) — não precisa de 'use client',
// renderiza inteiramente no servidor.

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Lucas Mendes',
    role: 'Desenvolvedor Front-end',
    quote:
      'Graças a essa plataforma, descobri meetups incríveis que me ajudaram a crescer na carreira. A comunidade é muito acolhedora!',
    avatar: 'LM',
  },
  {
    id: 2,
    name: 'Ana Souza',
    role: 'Engenheira de Software',
    quote:
      'Encontrei workshops e hackathons que nunca teria descoberto sozinha. É o lugar perfeito para quem quer se conectar com a comunidade tech.',
    avatar: 'AS',
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    role: 'Estudante de Ciência da Computação',
    quote:
      'Como estudante, essa plataforma foi essencial para eu encontrar eventos gratuitos e networking. Recomendo demais!',
    avatar: 'PO',
  },
]

function StarRating() {
  return (
    <Stack direction="row" spacing={0.25} sx={{ color: 'warning.main' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} fontSize="small" />
      ))}
    </Stack>
  )
}

export default function Testimonials() {
  return (
    <Box component="section" sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 5 }}>
          O que diz a comunidade
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {TESTIMONIALS.map((t) => (
            <Stack
              key={t.id}
              spacing={2}
              sx={{
                p: 3,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <StarRating />
              <Typography component="blockquote" variant="body1" sx={{ m: 0, flexGrow: 1 }}>
                &ldquo;{t.quote}&rdquo;
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{t.avatar}</Avatar>
                <Box>
                  <Typography variant="subtitle2" component="div">
                    {t.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.role}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
