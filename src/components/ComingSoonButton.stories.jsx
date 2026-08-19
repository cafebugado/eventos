import Stack from '@mui/material/Stack'
import ComingSoonButton from './ComingSoonButton'

export default {
  title: 'Design System/ComingSoonButton',
  component: ComingSoonButton,
}

export const Texto = {
  args: {
    variant: 'text',
    children: 'Entrar',
  },
}

export const Preenchido = {
  args: {
    variant: 'contained',
    children: 'Criar conta',
  },
}

export const Par = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <ComingSoonButton variant="text">Entrar</ComingSoonButton>
      <ComingSoonButton variant="contained">Criar conta</ComingSoonButton>
    </Stack>
  ),
}
