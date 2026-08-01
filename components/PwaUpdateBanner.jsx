'use client'

import { useState } from 'react'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { usePwa } from '../hooks/usePwa'

// Equivalente ao PwaUpdateBanner do app antigo (src/components/PwaUpdateBanner) —
// barra full-width no rodapé avisando que há uma versão nova do service worker
// esperando pra ativar.
export default function PwaUpdateBanner() {
  const { updateAvailable, applyUpdate } = usePwa()
  const [dismissed, setDismissed] = useState(false)

  const open = updateAvailable && !dismissed

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        square
        elevation={3}
        role="status"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.snackbar,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', px: 2.5, py: 1.5, maxWidth: 1280, mx: 'auto' }}
        >
          <RefreshOutlinedIcon color="primary" fontSize="small" />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            Nova versão disponível
          </Typography>
          <Button variant="contained" size="small" onClick={applyUpdate}>
            Atualizar
          </Button>
          <IconButton
            size="small"
            aria-label="Fechar"
            onClick={() => setDismissed(true)}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    </Slide>
  )
}
