import { DM_Sans } from 'next/font/google'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import Box from '@mui/material/Box'
import ThemeRegistry from '../theme/ThemeRegistry'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Eventos Café Bugado',
  description: 'Agenda de eventos da comunidade Café Bugado',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={dmSans.variable} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="data-mui-color-scheme" />
        <ThemeRegistry>
          {/* Header é fixed (ver Header.jsx) — o Box de main abre espaço com
              pt igual à altura do Toolbar (72px) para o conteúdo não ficar
              atrás dele. Footer usa mt:'auto' e o main flexGrow:1 para ficar
              sempre no rodapé mesmo em páginas com pouco conteúdo. */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1, pt: '72px' }}>
              {children}
            </Box>
            <Footer />
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  )
}
