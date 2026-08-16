'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { useColorScheme } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { NAVIGATION_ITEMS, ROUTES } from '../constants/navigation'
import { useFavouritesStore } from '../store/useFavouritesStore'
import { vivoVioleta } from '../theme/tokens/vivoVioleta'

const MOBILE_MENU_ORDER = [
  ROUTES.HOME,
  ROUTES.EVENTS,
  ROUTES.ABOUT,
  ROUTES.GALLERY,
  ROUTES.FAVOURITES,
  ROUTES.CONTACT,
]

const MOBILE_MENU_ITEM_BG = '#ffffff'
const MOBILE_MENU_ITEM_BORDER = '#e2e8f0'
const MOBILE_MENU_ITEM_COLOR = '#64748b'
const MOBILE_MENU_ACTIVE_COLOR = vivoVioleta['500']

const menuItemSx = (isActive) => (theme) => ({
  width: 142,
  height: 44,
  justifyContent: 'flex-start',
  px: 1.75,
  border: '1px solid',
  borderLeftWidth: isActive ? 4 : 1,
  borderColor: isActive ? MOBILE_MENU_ACTIVE_COLOR : MOBILE_MENU_ITEM_BORDER,
  borderRadius: `${theme.shape.borderRadius * 2}px`,
  bgcolor: MOBILE_MENU_ITEM_BG,
  color: isActive ? MOBILE_MENU_ACTIVE_COLOR : MOBILE_MENU_ITEM_COLOR,
  boxShadow: isActive ? theme.shadows[4] : theme.shadows[1],
  backdropFilter: 'blur(16px)',
  '& .MuiButton-startIcon': {
    ml: 0,
    mr: 1.25,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
  '&:hover': {
    bgcolor: MOBILE_MENU_ITEM_BG,
    borderColor: isActive ? MOBILE_MENU_ACTIVE_COLOR : MOBILE_MENU_ITEM_COLOR,
  },
  '&:active, &.Mui-focusVisible': {
    bgcolor: MOBILE_MENU_ITEM_BG,
  },
})

// Equivalente ao FloatingMenu do app antigo (src/components/FloatingMenu.jsx).
// Só aparece no mobile (Header.jsx já esconde a navegação e o toggle de tema
// abaixo do breakpoint md, então eles vivem só aqui para não duplicar affordance).
export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { mode, setMode } = useColorScheme()
  const favouritesCount = useFavouritesStore((state) => state.favourites.length)
  const isDarkMode = mode === 'dark'
  const navigationItems = MOBILE_MENU_ORDER.map((path) =>
    NAVIGATION_ITEMS.find((item) => item.path === path)
  ).filter((item) => item && (item.path !== ROUTES.FAVOURITES || favouritesCount > 0))

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleNavigate = (path) => {
    setOpen(false)
    router.push(path)
  }

  const handleToggleTheme = () => {
    setMode(isDarkMode ? 'light' : 'dark')
  }

  return (
    <>
      <Backdrop
        open={open}
        onClick={() => setOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: (theme) => theme.zIndex.speedDial - 1,
        }}
      />
      <Fade in={open} timeout={160} unmountOnExit>
        <Box
          component="nav"
          aria-label="Menu mobile"
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            right: 'calc(20px + env(safe-area-inset-right, 0px))',
            bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
            zIndex: (theme) => theme.zIndex.speedDial,
          }}
        >
          <Stack id="mobile-navigation-menu" role="menu" spacing={1.5}>
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.path
              return (
                <Button
                  key={item.path}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  startIcon={<IconComponent />}
                  onClick={() => handleNavigate(item.path)}
                  sx={menuItemSx(isActive)}
                >
                  {item.label}
                </Button>
              )
            })}
            <Button
              role="menuitem"
              startIcon={isDarkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              onClick={handleToggleTheme}
              sx={menuItemSx(false)}
            >
              {isDarkMode ? 'Claro' : 'Escuro'}
            </Button>
          </Stack>
        </Box>
      </Fade>
      <Fab
        color="primary"
        aria-label="Menu de navegação"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="mobile-navigation-menu"
        onClick={() => setOpen((current) => !current)}
        sx={(theme) => ({
          display: { xs: 'inline-flex', md: 'none' },
          position: 'fixed',
          bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
          right: 'calc(20px + env(safe-area-inset-right, 0px))',
          zIndex: theme.zIndex.speedDial + 1,
          width: 52,
          height: 52,
          minHeight: 52,
          borderRadius: `${theme.shape.borderRadius * 2}px`,
          boxShadow: theme.shadows[8],
        })}
      >
        {open ? (
          <CloseRoundedIcon sx={{ fontSize: 28 }} />
        ) : (
          <MenuRoundedIcon sx={{ fontSize: 28 }} />
        )}
      </Fab>
    </>
  )
}
