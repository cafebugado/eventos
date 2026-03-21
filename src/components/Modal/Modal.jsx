import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './Modal.css'

/**
 * Modal base reutilizável.
 *
 * Props:
 *   isOpen        boolean              — controla visibilidade
 *   onClose       () => void           — chamado ao fechar (X, overlay, Escape)
 *   title         string               — título no header
 *   size          'sm' | 'md' | 'lg'  — default 'md'
 *   children      ReactNode            — conteúdo (vai no modal-body)
 *   footer        ReactNode | null     — botões de ação; null oculta o footer
 *   closeOnOverlay boolean             — fechar ao clicar fora; default true
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
  const contentRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Trava scroll do body e salva foco anterior
  useEffect(() => {
    if (!isOpen) {
      return
    }
    previousFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'

    // Move foco para o primeiro elemento focável dentro do modal
    const frame = requestAnimationFrame(() => {
      const focusable = contentRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Fecha com Escape
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleOverlayClick = () => {
    if (closeOnOverlay) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        className={`modal-content modal-content--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer !== null && footer !== undefined && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
