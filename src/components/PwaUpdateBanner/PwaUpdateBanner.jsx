import { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { usePwa } from '../../hooks/usePwa.js'
import './PwaUpdateBanner.css'

export default function PwaUpdateBanner() {
  const { updateAvailable, applyUpdate } = usePwa()
  const [dismissed, setDismissed] = useState(false)

  if (!updateAvailable || dismissed) {
    return null
  }

  return (
    <div className="pwa-banner">
      <RefreshCw className="pwa-banner-icon" size={18} />
      <span className="pwa-banner-text">Nova versão disponível</span>
      <div className="pwa-banner-actions">
        <button className="pwa-banner-update-btn" onClick={applyUpdate}>
          Atualizar
        </button>
        <button
          className="pwa-banner-dismiss-btn"
          onClick={() => setDismissed(true)}
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
