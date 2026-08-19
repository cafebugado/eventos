'use client'

import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { usePwa } from '../hooks/usePwa'

const STORAGE_KEY = 'pwa-install-banner-dismissed'

// user agent nunca muda durante a vida do componente, então não precisa de
// subscribe de verdade — só de useSyncExternalStore pra evitar mismatch de
// hidratação (servidor não tem navigator, então o snapshot dele é sempre
// false). Mesmo padrão de hooks/useMediaQuery.js.
function subscribeNoop() {
  return () => {}
}

function getIsIOSSafariSnapshot() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return isIOS && isSafari
}

function getIsIOSSafariServerSnapshot() {
  return false
}

function useIsIOSSafari() {
  return useSyncExternalStore(subscribeNoop, getIsIOSSafariSnapshot, getIsIOSSafariServerSnapshot)
}

function IOSInstructions() {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.25,
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}>
        Para instalar no iPhone / iPad:
      </Typography>
      <Stack spacing={0.75} component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
        <Stack direction="row" spacing={0.75} component="li" sx={{ alignItems: 'flex-start' }}>
          <IosShareOutlinedIcon fontSize="inherit" color="primary" sx={{ mt: '2px' }} />
          <Typography variant="caption" color="text.secondary">
            Toque no botão <strong>Compartilhar</strong> na barra do Safari
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} component="li" sx={{ alignItems: 'flex-start' }}>
          <AddOutlinedIcon fontSize="inherit" color="primary" sx={{ mt: '2px' }} />
          <Typography variant="caption" color="text.secondary">
            Role para baixo e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong>
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} component="li" sx={{ alignItems: 'flex-start' }}>
          <SmartphoneOutlinedIcon fontSize="inherit" color="primary" sx={{ mt: '2px' }} />
          <Typography variant="caption" color="text.secondary">
            Toque em <strong>Adicionar</strong> para confirmar
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

// Equivalente ao PwaInstallBanner do app antigo — card flutuante centralizado
// no rodapé oferecendo instalar o PWA (ou, no iOS Safari, o passo a passo
// manual já que ali não existe beforeinstallprompt).
export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, install } = usePwa()
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)
  const isIOSSafari = useIsIOSSafari()
  const timerRef = useRef(null)
  const shownRef = useRef(false)

  const canShow = (isInstallable || isIOSSafari) && !isInstalled

  useEffect(() => {
    if (shownRef.current || !canShow) {
      return undefined
    }
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      return undefined
    }

    shownRef.current = true
    timerRef.current = setTimeout(() => setVisible(true), 3000)

    return () => clearTimeout(timerRef.current)
  }, [canShow])

  function handleDismiss() {
    setVisible(false)
  }

  function handleNeverShow() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  async function handleInstall() {
    setInstalling(true)
    const outcome = await install()
    setInstalling(false)
    if (outcome === 'accepted') {
      setVisible(false)
    }
  }

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Paper
        elevation={4}
        role="dialog"
        aria-label="Instalar aplicativo"
        sx={{
          // Não usa left:50% + transform:translateX(-50%) pra centralizar
          // porque o Slide já usa a propriedade transform pra animar — as
          // duas brigam pelo mesmo canal e uma sobrescreve a outra. Left/right
          // simétricos + mx:auto centralizam sem precisar de transform.
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          mx: 'auto',
          zIndex: (theme) => theme.zIndex.snackbar,
          width: 'min(420px, calc(100vw - 32px))',
          borderRadius: 3,
          p: 2,
        }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <SmartphoneOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                Instale o app no seu dispositivo!
              </Typography>
            </Stack>
            <IconButton
              size="small"
              aria-label="Fechar"
              onClick={handleDismiss}
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Acesse eventos, agenda e novidades direto da tela inicial — sem precisar abrir o
            navegador. Funciona offline também!
          </Typography>

          {isIOSSafari ? (
            <IOSInstructions />
          ) : (
            <Button
              variant="contained"
              fullWidth
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleInstall}
              disabled={installing}
            >
              {installing ? 'Aguarde…' : 'Instalar agora'}
            </Button>
          )}

          <Button
            variant="text"
            size="small"
            onClick={handleNeverShow}
            sx={{ alignSelf: 'center' }}
          >
            Não mostrar novamente
          </Button>
        </Stack>
      </Paper>
    </Slide>
  )
}
