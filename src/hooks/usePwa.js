import { useState, useEffect, useRef } from 'react'
import {
  registerServiceWorker,
  getSwStatus,
  skipWaiting as swSkipWaiting,
  isInstalledPwa,
  canInstall,
  promptInstall,
} from '../lib/pwa.js'

export function usePwa() {
  const [swStatus, setSwStatus] = useState('idle')
  const [isInstallable, setIsInstallable] = useState(canInstall)
  const registrationRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const onInstallPrompt = () => {
      if (isMounted) {
        setIsInstallable(true)
      }
    }
    window.addEventListener('beforeinstallprompt', onInstallPrompt)

    registerServiceWorker().then((registration) => {
      if (!isMounted || !registration) {
        return
      }
      registrationRef.current = registration
      setSwStatus(getSwStatus(registration))

      const trackInstalling = (sw) => {
        if (!sw) {
          return
        }
        sw.addEventListener('statechange', () => {
          if (!isMounted) {
            return
          }
          setSwStatus(getSwStatus(registrationRef.current))
        })
      }

      registration.addEventListener('updatefound', () => {
        trackInstalling(registration.installing)
        if (isMounted) {
          setSwStatus(getSwStatus(registration))
        }
      })

      trackInstalling(registration.installing)
    })

    return () => {
      isMounted = false
      window.removeEventListener('beforeinstallprompt', onInstallPrompt)
    }
  }, [])

  const install = () => promptInstall()

  const applyUpdate = () => {
    swSkipWaiting(registrationRef.current)
    window.location.reload()
  }

  return {
    isInstallable,
    isInstalled: isInstalledPwa(),
    swStatus,
    updateAvailable: swStatus === 'waiting',
    install,
    applyUpdate,
  }
}
