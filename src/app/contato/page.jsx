import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contato | Eventos Café Bugado',
  description:
    'Entre em contato com a Comunidade Café Bugado. Fale conosco para dúvidas, sugestões, parcerias ou para indicar eventos de tecnologia.',
}

const CONTACT_ITEMS = [
  {
    icon: MailOutlineOutlinedIcon,
    title: 'Email',
    value: 'comunidade.cafebugado@gmail.com',
    description: 'Fale com a gente para dúvidas, sugestões ou parcerias. Resposta em até 24h.',
  },
  {
    icon: ChatOutlinedIcon,
    title: 'WhatsApp',
    value: '+55 11 96188-9886',
    description:
      'Canal direto para falar com a comunidade e tirar dúvidas rápidas. Seg a sex, das 9h às 18h.',
  },
  {
    icon: LocationOnOutlinedIcon,
    title: 'Localização',
    value: 'Brasil',
    description: 'Atendimento remoto para todo o Brasil.',
  },
]

export default function ContactPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Vamos fortalecer a{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            comunidade juntos
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 640, mx: 'auto', fontSize: '1.05rem' }}
        >
          Se você organiza eventos, participa ou quer colaborar, a gente quer ouvir você. Conte sua
          ideia, dúvida ou sugestão e vamos conversar.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Stack
                key={item.title}
                direction="row"
                spacing={2}
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
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Stack>
            )
          })}
        </Stack>

        <Box
          sx={{
            p: { xs: 2.5, md: 4 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <ContactForm />
        </Box>
      </Box>
    </Container>
  )
}
