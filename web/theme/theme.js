import { createTheme } from '@mui/material/styles'

// Tokens traduzidos de src/styles/variables.css (app antigo) para preservar
// a identidade visual do Café Bugado na nova stack (Next.js + MUI).
const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#2563eb', // --primary-blue
          dark: '#1d4ed8', // --dark-blue
          light: '#3b82f6', // --light-blue
          contrastText: '#ffffff',
        },
        background: {
          default: '#ffffff', // --background
          paper: '#f8fafc', // --surface
        },
        text: {
          primary: '#1e293b', // --text-primary
          secondary: '#64748b', // --text-secondary
        },
        divider: '#e2e8f0', // --border
        info: { main: '#3b82f6' }, // --status-info
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
          contrastText: '#ffffff',
        },
        background: {
          default: '#0f172a',
          paper: '#1e293b',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
        },
        divider: '#334155',
        info: { main: '#3b82f6' },
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
