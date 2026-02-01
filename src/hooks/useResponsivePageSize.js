import { useEffect, useState } from 'react'

const DEFAULT_BREAKPOINT = 768
const DEFAULT_DESKTOP_SIZE = 9
const DEFAULT_MOBILE_SIZE = 6

function resolvePageSize(isMobile, mobile, desktop) {
  return isMobile ? mobile : desktop
}

export default function useResponsivePageSize(options = {}) {
  const {
    breakpoint = DEFAULT_BREAKPOINT,
    desktop = DEFAULT_DESKTOP_SIZE,
    mobile = DEFAULT_MOBILE_SIZE,
  } = options

  const isBrowser = typeof window !== 'undefined'
  const supportsMatchMedia = isBrowser && typeof window.matchMedia === 'function'

  const getIsMobile = () => {
    if (!isBrowser) {
      return false
    }
    if (supportsMatchMedia) {
      return window.matchMedia(`(max-width: ${breakpoint}px)`).matches
    }
    return window.innerWidth <= breakpoint
  }

  const [pageSize, setPageSize] = useState(() => resolvePageSize(getIsMobile(), mobile, desktop))

  useEffect(() => {
    if (!isBrowser) {
      return
    }

    const updateSize = (matches) => {
      setPageSize((current) => {
        const nextSize = resolvePageSize(matches, mobile, desktop)
        return current === nextSize ? current : nextSize
      })
    }

    if (!supportsMatchMedia) {
      const handleResize = () => updateSize(window.innerWidth <= breakpoint)
      handleResize()
      window.addEventListener('resize', handleResize)

      return () => window.removeEventListener('resize', handleResize)
    }

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    updateSize(mediaQuery.matches)

    const handleChange = (event) => updateSize(event.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [breakpoint, desktop, mobile, isBrowser, supportsMatchMedia])

  return pageSize
}
