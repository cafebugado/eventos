'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import EmotionCacheProvider from './EmotionCacheProvider'
import theme from './theme'

export default function ThemeRegistry({ children }) {
  return (
    <EmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme} defaultMode="light" disableTransitionOnChange>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  )
}
