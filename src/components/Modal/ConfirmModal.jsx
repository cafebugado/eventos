import { Loader2, Trash2 } from 'lucide-react'
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
 *   icon           ReactNode | null  — ícone; default <Trash2> vermelho
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
    icon !== undefined ? icon : <Trash2 size={40} className="modal-confirm-icon" />

  const footer = (
    <>
      <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className={confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 size={16} className="spinning" /> : null}
        {confirmLabel}
      </button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} footer={footer}>
      <div className="modal-confirm-body">
        {resolvedIcon}
        <p>{message}</p>
      </div>
    </Modal>
  )
}
