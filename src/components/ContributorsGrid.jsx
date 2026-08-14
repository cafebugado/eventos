'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'

// `contributors` vem pronto do servidor (app/sobre/page.jsx via
// getContributors, passado como prop) — sem loading state/skeleton
// client-side, ao contrário do useEffect+useState do app antigo. Precisa ser
// 'use client' porque Tooltip + IconButton component="a" como filho direto
// de um Server Component causa hydration mismatch (o servidor renderiza um
// <span> placeholder no lugar do <a> real) — mesmo padrão de Tooltip usado
// em Footer.jsx, que já é client, funciona sem esse problema.
export default function ContributorsGrid({ contributors = [] }) {
  return (
    <Stack spacing={4} sx={{ mt: { xs: 6, md: 8 } }}>
      <Stack spacing={4} sx={{ alignItems: 'center' }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{ fontSize: { xs: '1.85rem', md: '2.25rem' }, textAlign: 'center' }}
        >
          Quem mantém este{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            projeto
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.05rem', maxWidth: 760, width: '100%', textAlign: 'justify' }}
        >
          Este projeto é feito pela comunidade. Conheça as pessoas que contribuem para manter esta
          plataforma funcionando e sempre melhorando.
        </Typography>
      </Stack>

      {contributors.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Nenhum contribuinte cadastrado ainda.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1.5, sm: 3 },
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {contributors.map((contributor) => (
            <Stack
              key={contributor.id}
              spacing={{ xs: 1, sm: 1.5 }}
              sx={{
                p: { xs: 1.5, sm: 3 },
                minWidth: 0,
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Avatar
                src={contributor.avatar_url}
                alt={contributor.nome}
                sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 } }}
              />
              <Typography
                variant="subtitle1"
                sx={{
                  width: '100%',
                  minWidth: 0,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 600,
                  overflowWrap: 'anywhere',
                }}
              >
                {contributor.nome}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title={`GitHub de ${contributor.nome}`}>
                  <IconButton
                    component="a"
                    href={contributor.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {contributor.linkedin_url && (
                  <Tooltip title={`LinkedIn de ${contributor.nome}`}>
                    <IconButton
                      component="a"
                      href={contributor.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <LinkedInIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {contributor.portfolio_url && (
                  <Tooltip title={`Portfólio de ${contributor.nome}`}>
                    <IconButton
                      component="a"
                      href={contributor.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <OpenInNewOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          ))}
        </Box>
      )}
    </Stack>
  )
}
