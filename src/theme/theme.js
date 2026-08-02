import { createTheme } from '@mui/material/styles'
import { vivoVioleta } from './tokens/vivoVioleta'

// Tokens traduzidos de src/styles/variables.css (app antigo) para preservar
// a identidade visual do Café Bugado na nova stack (Next.js + MUI).
// Cor primária, "info" e o fundo geral da página (background.default) vêm do
// token vivo-violeta (src/theme/tokens/) — mesma cor usada no Header (que
// referencia o token direto, não theme.palette.background.default: com
// cssVariables ativado esse acesso via JS não reage à troca de tema, ver
// comentário em Header.jsx). background.paper (cards/modais) e text/divider
// seguem os valores anteriores até novos tokens serem definidos.
const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: vivoVioleta['500'],
          dark: vivoVioleta['600'],
          light: vivoVioleta['350'],
          contrastText: '#ffffff',
        },
        background: {
          default: vivoVioleta['50'],
          paper: '#f8fafc', // --surface
        },
        text: {
          primary: '#1e293b', // --text-primary
          secondary: '#64748b', // --text-secondary
        },
        divider: '#e2e8f0', // --border
        info: { main: vivoVioleta['350'] },
      },
    },
    dark: {
      palette: {
        primary: {
          main: vivoVioleta['350'],
          dark: vivoVioleta['500'],
          light: vivoVioleta['200'],
          contrastText: '#ffffff',
        },
        background: {
          default: vivoVioleta['950'],
          paper: '#1e293b',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
        },
        divider: '#334155',
        info: { main: vivoVioleta['200'] },
      },
    },
  },
  shape: {
    borderRadius: 8, // --radius-md: 0.5rem
  },
  typography: {
    fontFamily: [
      'DM Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'system-ui',
      'sans-serif',
    ].join(','),
  },
})

export default theme
