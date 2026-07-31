'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { alpha, useColorScheme } from '@mui/material/styles'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { NAVIGATION_ITEMS } from '../constants/navigation'

// Next.js <Link> já faz prefetch automático das rotas visíveis/no hover —
// substitui o PREFETCH_MAP manual (onMouseEnter + import dinâmico) do app antigo.
//
// No app antigo o header inteiro some no mobile (a navegação mobile é feita
// pelo FloatingMenu, ainda não portado). Aqui mantemos logo + toggle de tema
// visíveis no mobile e escondemos só a navegação, para não deixar o mobile
// sem header até o FloatingMenu ser portado.
export default function Header() {
  const { mode, setMode } = useColorScheme()
  const pathname = usePathname()
  const isScrolled = useScrollTrigger({ disableHysteresis: true, threshold: 20 })
  const isDarkMode = mode === 'dark'

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={(theme) => ({
        backdropFilter: 'blur(20px)',
        backgroundColor: isScrolled
          ? theme.palette.background.paper
          : alpha(theme.palette.background.paper, 0.8),
        borderBottom: isScrolled ? `1px solid ${theme.palette.divider}` : '1px solid transparent',
        transition: theme.transitions.create(['background-color', 'border-color']),
      })}
    >
      <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', height: 72, px: { xs: 2, md: 4 } }}>
        <Box
          component="a"
          href="https://cafebugado.com.br"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Box
            component="img"
            src="/logoEventosCafeBugado.png"
            alt="Eventos Cafe Bugado"
            sx={{ height: 36 }}
          />
        </Box>

        <Box
          component="nav"
          sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 'auto', mr: 2 }}
        >
          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.path
            return (
              <Button
                key={item.path}
                component={Link}
                href={item.path}
                startIcon={<IconComponent fontSize="small" />}
                sx={{
                  color: isActive ? 'primary.main' : 'text.secondary',
                  bgcolor: isActive ? 'action.selected' : 'transparent',
                  borderRadius: 2.5,
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Box>

        <IconButton
          onClick={() => setMode(isDarkMode ? 'light' : 'dark')}
          aria-label="Alternar tema"
          sx={{ ml: { xs: 'auto', md: 0 } }}
        >
          {isDarkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
