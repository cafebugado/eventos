import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import StatCounter from './StatCounter'

const FEATURES = [
  {
    icon: GpsFixedOutlinedIcon,
    title: 'Curadoria Especializada',
    description:
      'Os eventos são indicados por comunidades e pessoas da área. Antes de publicar, avaliamos se fazem sentido para quem está começando ou já atua em tecnologia.',
  },
  {
    icon: BoltOutlinedIcon,
    title: 'Atualização em Tempo Real',
    description:
      'As informações são atualizadas constantemente para refletir mudanças de data, local ou formato dos eventos. Assim você acompanha tudo sem depender de vários canais diferentes.',
  },
  {
    icon: PublicOutlinedIcon,
    title: 'Diversidade de Categorias',
    description:
      'Reunimos eventos de diferentes formatos e temas dentro da tecnologia. De encontros para iniciantes a eventos mais técnicos, presenciais ou online.',
  },
  {
    icon: HandshakeOutlinedIcon,
    title: 'Comunidade Ativa',
    description:
      'Conecte-se com pessoas que participam ativamente da comunidade de tecnologia. Aqui você encontra quem aprende, compartilha eventos, troca experiências e ajuda outros a crescer na área.',
  },
  {
    icon: MenuBookOutlinedIcon,
    title: 'Conteúdo Acessível',
    description:
      'Acreditamos que o conhecimento deve ser para todos. Priorizamos eventos gratuitos e acessíveis, para que qualquer pessoa possa aprender e se desenvolver na área de tecnologia.',
  },
  {
    icon: FavoriteBorderOutlinedIcon,
    title: 'Projeto Colaborativo',
    description:
      'Mantido por voluntários apaixonados por tecnologia. Qualquer pessoa pode sugerir eventos, contribuir com melhorias e ajudar a fortalecer o ecossistema tech da comunidade.',
  },
]

// Server Component: `totalEventos` vem pronto do servidor (app/sobre/page.jsx
// via getEventStats) — sem loading state client-side, ao contrário do
// useEventStats()/SWR do app antigo.
export default function AboutFeatures({ totalEventos }) {
  return (
    <Stack spacing={4}>
      <Typography variant="h3" component="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.25rem' } }}>
        Um jeito mais simples de descobrir{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>
          eventos de tecnologia
        </Box>
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontSize: '1.05rem', maxWidth: 760 }}
      >
        A Comunidade Café Bugado surgiu porque encontrar eventos de tecnologia nem sempre é simples.
        As informações ficam espalhadas em vários lugares. Criamos um espaço para reunir tudo em um
        só ponto e facilitar o acesso de quem quer participar, aprender e se conectar com a
        comunidade.
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        divider={
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              borderLeft: '1px solid',
              borderColor: 'divider',
            }}
          />
        }
      >
        <StatCounter
          value={3}
          suffix=" anos"
          label="Conectando pessoas por meio de eventos e iniciativas da comunidade"
        />
        {totalEventos !== null && (
          <StatCounter
            value={totalEventos}
            suffix="+"
            label="Eventos cadastrados na plataforma pela comunidade"
          />
        )}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        }}
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <Stack
              key={feature.title}
              spacing={1.5}
              sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon fontSize="large" />
              </Box>
              <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 600 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Stack>
          )
        })}
      </Box>
    </Stack>
  )
}
