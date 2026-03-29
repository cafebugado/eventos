import { useState, useEffect, useRef } from 'react'
import { X, Download, Share, Plus, Smartphone } from 'lucide-react'
import { usePwa } from '../../hooks/usePwa.js'
import './PwaInstallBanner.css'

const STORAGE_KEY = 'pwa-install-banner-dismissed'

function detectPlatform() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return { isIOS, isIOSSafari: isIOS && isSafari }
}

function IOSInstructions() {
  return (
    <div className="pwa-install-instructions">
      <p className="pwa-install-instructions-title">Para instalar no iPhone / iPad:</p>
      <ol className="pwa-install-steps">
        <li>
          <span className="pwa-install-step-icon">
            <Share size={15} />
          </span>
          Toque no botão <strong>Compartilhar</strong> na barra do Safari
        </li>
        <li>
          <span className="pwa-install-step-icon">
            <Plus size={15} />
          </span>
          Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
        </li>
        <li>
          <span className="pwa-install-step-icon">
            <Smartphone size={15} />
          </span>
          Toque em <strong>Adicionar</strong> para confirmar
        </li>
      </ol>
    </div>
  )
}

const { isIOSSafari } = detectPlatform()

export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, install } = usePwa()
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)
  const timerRef = useRef(null)
  const shownRef = useRef(false)

  // canShow: Android/Desktop quando isInstallable vira true; iOS Safari sempre
  const canShow = (isInstallable || isIOSSafari) && !isInstalled

  useEffect(() => {
    // Já agendou ou já mostrou — não repetir
    if (shownRef.current) {
      return
    }
    if (!canShow) {
      return
    }
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      return
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

  if (!visible) {
    return null
  }

  return (
    <div className="pwa-install-banner" role="dialog" aria-label="Instalar aplicativo">
      <div className="pwa-install-banner-header">
        <div className="pwa-install-banner-title">
          <Smartphone size={18} className="pwa-install-banner-icon" />
          <span>Instale o app no seu dispositivo!</span>
        </div>
        <button className="pwa-install-close-btn" onClick={handleDismiss} aria-label="Fechar">
          <X size={16} />
        </button>
      </div>

      <p className="pwa-install-banner-desc">
        Acesse eventos, agenda e novidades direto da tela inicial — sem precisar abrir o navegador.
        Funciona offline também!
      </p>

      {isIOSSafari ? (
        <IOSInstructions />
      ) : (
        <button className="pwa-install-action-btn" onClick={handleInstall} disabled={installing}>
          <Download size={16} />
          {installing ? 'Aguarde…' : 'Instalar agora'}
        </button>
      )}

      <button className="pwa-install-never-btn" onClick={handleNeverShow}>
        Não mostrar novamente
      </button>
    </div>
  )
}
