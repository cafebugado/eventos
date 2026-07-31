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
