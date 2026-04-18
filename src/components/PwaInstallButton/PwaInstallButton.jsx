import { Download } from 'lucide-react'
import { usePwa } from '../../hooks/usePwa.js'
import './PwaInstallButton.css'

export default function PwaInstallButton({ className = '' }) {
  const { isInstallable, isInstalled, install } = usePwa()

  if (!isInstallable || isInstalled) {
    return null
  }

  return (
    <button className={`pwa-install-btn ${className}`.trim()} onClick={install}>
      <Download size={16} className="pwa-install-icon" />
      Instalar App
    </button>
  )
}
