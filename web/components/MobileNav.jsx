'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import Backdrop from '@mui/material/Backdrop'
import { useColorScheme } from '@mui/material/styles'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { NAVIGATION_ITEMS } from '../constants/navigation'

// Equivalente ao FloatingMenu do app antigo (src/components/FloatingMenu.jsx),
// reconstruído com o SpeedDial do MUI em vez de CSS customizado. Só aparece
// no mobile (Header.jsx já esconde a navegação e o toggle de tema abaixo do
// breakpoint md, então eles vivem só aqui para não duplicar affordance).
export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { mode, setMode } = useColorScheme()
  const isDarkMode = mode === 'dark'

  const handleNavigate = (path) => {
    setOpen(false)
    router.push(path)
  }

  const handleToggleTheme = () => {
    setOpen(false)
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
      <SpeedDial
        ariaLabel="Menu de navegação"
        icon={<SpeedDialIcon />}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          right: 24,
        }}
      >
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = item.icon
          const isActive = pathname === item.path
          return (
            <SpeedDialAction
              key={item.path}
              icon={<IconComponent fontSize="small" />}
              onClick={() => handleNavigate(item.path)}
              slotProps={{
                tooltip: { title: item.label, open: true },
                fab: { sx: { color: isActive ? 'primary.main' : 'text.secondary' } },
              }}
            />
          )
        })}
        <SpeedDialAction
          icon={
            isDarkMode ? (
              <LightModeOutlinedIcon fontSize="small" />
            ) : (
              <DarkModeOutlinedIcon fontSize="small" />
            )
          }
          slotProps={{
            tooltip: { title: isDarkMode ? 'Modo claro' : 'Modo escuro', open: true },
          }}
          onClick={handleToggleTheme}
        />
      </SpeedDial>
    </>
  )
}
