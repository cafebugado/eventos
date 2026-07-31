'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import Modal from './Modal'

/**
 * Modal de confirmação reutilizável (destrutivo ou primário).
 *
 * Props:
 *   isOpen         boolean
 *   onClose        () => void        — chamado no Cancelar / X / Escape
 *   onConfirm      () => void        — chamado no botão de confirmação
 *   title          string            — título do modal
 *   message        ReactNode         — texto/conteúdo de confirmação
 *   icon           ReactNode | null  — ícone; default ícone de lixeira vermelho
 *   confirmLabel   string            — label do botão confirmar; default 'Excluir'
 *   cancelLabel    string            — label do botão cancelar; default 'Cancelar'
 *   confirmVariant 'danger' | 'primary' — estilo do botão confirmar; default 'danger'
 *   isLoading      boolean           — desabilita botões e mostra spinner
 *   size           'sm' | 'md'       — default 'sm'
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  icon,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  confirmVariant = 'danger',
  isLoading = false,
  size = 'sm',
}) {
  const resolvedIcon =
    icon !== undefined ? icon : <DeleteOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />

  const footer = (
    <>
      <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button
        variant="contained"
        color={confirmVariant === 'danger' ? 'error' : 'primary'}
        onClick={onConfirm}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {confirmLabel}
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} footer={footer}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'center',
        }}
      >
        {resolvedIcon}
        <Typography component="p">{message}</Typography>
      </Box>
    </Modal>
  )
}
