import Box from '@mui/material/Box'
import Header from './Header'

export default {
  title: 'Design System/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
}

export const Home = {
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
}

export const RotaEventos = {
  parameters: {
    nextjs: { navigation: { pathname: '/eventos' } },
  },
}

// Variação dark: fundo quase preto/violeta (token vivo-violeta), item ativo
// com sublinhado em vez de pílula, e os botões de Entrar/Criar conta (ainda
// sem login no app — aparecem desabilitados, com cadeado + badge "Em breve").
// O atributo data-mui-color-scheme força esse subtree pro modo dark
// independente do tema padrão do Storybook (ver .storybook/preview.jsx).
export const HomeDark = {
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <Box data-mui-color-scheme="dark">
        <Story />
      </Box>
    ),
  ],
}
