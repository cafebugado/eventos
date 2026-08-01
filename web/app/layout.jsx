import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import Box from '@mui/material/Box'
import ThemeRegistry from '../theme/ThemeRegistry'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MobileNav from '../components/MobileNav'
import PwaInstallBanner from '../components/PwaInstallBanner'
import PwaUpdateBanner from '../components/PwaUpdateBanner'
import NewEventToastContainer from '../components/NewEventToastContainer'
import WebVitalsReporter from '../components/WebVitalsReporter'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

// metadataBase resolve URLs relativas (og:image, canonical, etc.) declaradas
// pelas páginas — sem isso o Next avisa em build e as tags OG ficam relativas
// (quebrando previews em redes sociais). Fallback é o domínio de produção do
// app antigo (ver api/sitemap.ts na raiz); configurável via
// NEXT_PUBLIC_SITE_URL para preview/staging.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eventos.cafebugado.com.br'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Eventos Café Bugado',
  description: 'Agenda de eventos da comunidade Café Bugado',
  openGraph: {
    siteName: 'Eventos - Comunidade Café Bugado',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport = {
  themeColor: '#2563eb',
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
          <MobileNav />
          <PwaUpdateBanner />
          <PwaInstallBanner />
          <NewEventToastContainer />
          <WebVitalsReporter />
        </ThemeRegistry>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
