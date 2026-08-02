'use client'

import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { vivoVioleta } from '../theme/tokens/vivoVioleta'

const WIDTH = 52
const HEIGHT = 28
const THUMB_SIZE = 20
const THUMB_INSET = 4

// Switch de tema (claro/escuro) em formato pílula com ícone + bolinha
// deslizante — só cores do token vivo-violeta (950 no escuro, 500 no claro)
// e branco pro ícone/bolinha, sem cor fora do token.
export default function ThemeToggleSwitch({ checked, onChange, 'aria-label': ariaLabel }) {
  return (
    <ButtonBase
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      sx={{
        position: 'relative',
        width: WIDTH,
        height: HEIGHT,
        borderRadius: HEIGHT / 2,
        bgcolor: checked ? vivoVioleta['950'] : vivoVioleta['500'],
        transition: 'background-color 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: checked ? THUMB_INSET : WIDTH - THUMB_SIZE - THUMB_INSET,
          transform: 'translateY(-50%)',
          transition: 'left 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
        }}
      >
        {checked ? (
          <DarkModeOutlinedIcon sx={{ fontSize: 14 }} />
        ) : (
          <LightModeOutlinedIcon sx={{ fontSize: 14 }} />
        )}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: checked ? WIDTH - THUMB_SIZE - THUMB_INSET : THUMB_INSET,
          transform: 'translateY(-50%)',
          transition: 'left 0.2s ease',
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: '50%',
          bgcolor: '#ffffff',
        }}
      />
    </ButtonBase>
  )
}
