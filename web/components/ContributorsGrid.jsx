import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'

// Server Component: `contributors` vem pronto do servidor (app/sobre/page.jsx
// via getContributors) — sem loading state/skeleton client-side, ao contrário
// do useEffect+useState do app antigo.
export default function ContributorsGrid({ contributors = [] }) {
  return (
    <Stack spacing={3} sx={{ mt: { xs: 6, md: 8 } }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h2">
          Quem mantém este{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            projeto
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 640, mx: 'auto', mt: 1 }}
        >
          Este projeto é feito pela comunidade. Conheça as pessoas que contribuem para manter esta
          plataforma funcionando e sempre melhorando.
        </Typography>
      </Box>

      {contributors.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Nenhum contribuinte cadastrado ainda.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {contributors.map((contributor) => (
            <Stack
              key={contributor.id}
              spacing={1.5}
              sx={{
                p: 3,
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
                sx={{ width: 72, height: 72 }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
