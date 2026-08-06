import { createTheme } from '@mui/material/styles'
import { vivoVioleta } from './tokens/vivoVioleta'

// Tokens traduzidos de src/styles/variables.css (app antigo) para preservar
// a identidade visual do Café Bugado na nova stack (Next.js + MUI).
// Cor primária, "info", background.default e (no modo escuro) background.paper
// vêm do token vivo-violeta (src/theme/tokens/) — mesma cor usada no Header (que
// referencia o token direto, não theme.palette.background.default: com
// cssVariables ativado esse acesso via JS não reage à troca de tema, ver
// comentário em Header.jsx). text/divider e background.paper do modo claro
// continuam neutros (não fazem parte da escala vivo-violeta) — texto de evento
// longo perde legibilidade com tom de marca saturado nessas cores.
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
          paper: vivoVioleta['950'],
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
    borderRadius: 4, // DESIGN.md rounded.md — botão/input/dialog; cards usam 12 (ver components.MuiCard abaixo)
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
    // Escala tipográfica do DESIGN.md (tamanho/peso/line-height/letter-spacing);
    // fontFamily continua DM Sans — identidade de marca já fixada neste rebrand,
    // não uma lacuna a preencher com o system-ui detectado no site de referência.
    h1: {
      fontSize: '3rem',
      fontWeight: 500,
      lineHeight: 0.9,
      letterSpacing: '-1.4px',
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 600,
      lineHeight: 0.94,
      letterSpacing: '-1.4px',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '-1.2px',
    },
    h4: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 0.94,
      letterSpacing: '-1.2px',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.35,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
      textTransform: 'none',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // DESIGN.md rounded.lg — surface-card/feature-card
        },
      },
    },
  },
})

export default theme
