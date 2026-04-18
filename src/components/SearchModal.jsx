import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Modal from './Modal/Modal'
import './SearchModal.css'

export default function SearchModal({ isOpen, onClose, value, onChange }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50)
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar evento" size="sm" footer={null}>
      <div className="sm-input-row">
        <Search size={18} className="sm-icon" />
        <input
          ref={inputRef}
          type="text"
          className="sm-input"
          placeholder="Buscar evento..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="sm-clear" onClick={() => onChange('')} aria-label="Limpar busca">
            <X size={16} />
          </button>
        )}
      </div>
    </Modal>
  )
}
