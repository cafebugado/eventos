'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

const SIZE_MAP = { sm: 400, md: 600, lg: 740 }

/**
 * Modal base reutilizável, construído sobre o Dialog do MUI (que já cuida de
 * portal, foco/focus-trap, scroll-lock e Escape — não precisamos reimplementar).
 *
 * Props:
 *   isOpen         boolean              — controla visibilidade
 *   onClose        () => void           — chamado ao fechar (X, overlay, Escape)
 *   title          string               — título no header
 *   size           'sm' | 'md' | 'lg'   — default 'md'
 *   children       ReactNode            — conteúdo
 *   footer         ReactNode | null     — botões de ação; null/undefined oculta o footer
 *   closeOnOverlay boolean              — fechar ao clicar fora; default true
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
}) {
  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' && !closeOnOverlay) {
      return
    }
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-title"
      slotProps={{ paper: { sx: { maxWidth: SIZE_MAP[size] ?? SIZE_MAP.md, width: '100%' } } }}
    >
      <DialogTitle
        id="modal-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
      >
        {title}
        <IconButton onClick={onClose} aria-label="Fechar" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {footer !== null && footer !== undefined && <DialogActions>{footer}</DialogActions>}
    </Dialog>
  )
}
