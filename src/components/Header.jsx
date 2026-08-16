'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { alpha, useColorScheme } from '@mui/material/styles'
import { NAVIGATION_ITEMS, ROUTES } from '../constants/navigation'
import { useFavouritesStore } from '../store/useFavouritesStore'
import ComingSoonButton from './ComingSoonButton'
import ThemeToggleSwitch from './ThemeToggleSwitch'
import { vivoVioleta } from '../theme/tokens/vivoVioleta'

// Next.js <Link> já faz prefetch automático das rotas visíveis/no hover —
// substitui o PREFETCH_MAP manual (onMouseEnter + import dinâmico) do app antigo.
//
// No mobile a navegação e o toggle de tema saem daqui e vivem no MobileNav
// (components/MobileNav.jsx, equivalente ao FloatingMenu do app antigo) —
// mantemos só a logo visível no header em telas pequenas.
export default function Header() {
  const { mode, setMode } = useColorScheme()
  const pathname = usePathname()
  const favouritesCount = useFavouritesStore((state) => state.favourites.length)
  const isScrolled = useScrollTrigger({ disableHysteresis: true, threshold: 20 })
  const isDarkMode = mode === 'dark'
  const navigationItems = NAVIGATION_ITEMS.filter(
    (item) => item.path !== ROUTES.FAVOURITES || favouritesCount > 0
  )

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={(theme) => {
        // Não dá pra usar theme.palette.background.default aqui: com
        // cssVariables ativado, esse acesso direto (fora de um path tipo
        // "background.default") fica travado no scheme padrão (light) e não
        // reage à troca de tema — alpha() também não entende var(...), só
        // cor literal. Por isso o valor vem direto do token, escolhido pelo
        // isDarkMode (estado real do React), igual o resto do Header.
        const bg = isDarkMode ? vivoVioleta['950'] : vivoVioleta['50']
        return {
          backdropFilter: 'blur(20px)',
          backgroundColor: isScrolled ? bg : alpha(bg, 0.85),
          borderBottom: isScrolled
            ? `1px solid ${alpha(vivoVioleta['500'], isDarkMode ? 0.35 : 0.25)}`
            : '1px solid transparent',
          transition: theme.transitions.create(['background-color', 'border-color']),
        }
      }}
    >
      <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', height: 72, px: { xs: 2, md: 4 } }}>
        <Box
          component="a"
          href="https://cafebugado.com.br"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'flex', alignItems: 'center', flex: 1 }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Eventos Cafe Bugado"
            sx={{ display: 'block', height: { xs: 36, md: 52 }, width: 'auto' }}
          />
        </Box>

        <Stack
          direction="row"
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 1,
          }}
        >
          <ComingSoonButton variant="text" size="small">
            Entrar
          </ComingSoonButton>
        </Stack>

        <Box
          component="nav"
          sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1, justifyContent: 'center' }}
        >
          {navigationItems.map((item) => {
            const isActive = pathname === item.path
            const activeColor = isDarkMode ? vivoVioleta['200'] : vivoVioleta['500']
            return (
              <Button
                key={item.path}
                component={Link}
                href={item.path}
                sx={{
                  color: isActive ? activeColor : 'text.primary',
                  bgcolor: 'transparent',
                  borderRadius: 0,
                  borderBottom: '2px solid',
                  borderColor: isActive ? activeColor : 'transparent',
                  pb: 0.5,
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          <Stack direction="row" spacing={1}>
            <ComingSoonButton variant="text">Entrar</ComingSoonButton>
            <ComingSoonButton variant="contained">Criar conta</ComingSoonButton>
          </Stack>
          <ThemeToggleSwitch
            checked={isDarkMode}
            onChange={() => setMode(isDarkMode ? 'light' : 'dark')}
            aria-label="Alternar tema"
          />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
