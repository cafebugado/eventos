import { DM_Sans } from 'next/font/google'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import ThemeRegistry from '../theme/ThemeRegistry'
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
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
