import { useState, useRef, useEffect } from 'react'
import { CalendarPlus, ChevronDown, ExternalLink, Download, Check } from 'lucide-react'
import { downloadICS, getGoogleCalendarUrl } from '../utils/calendarExport'
import './AddToCalendarButton.css'

const GoogleCalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M8 14h2.5l-1 2.5L12 14h2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
)

const OutlookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect
      x="2"
      y="5"
      width="14"
      height="14"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path
      d="M9 5V3.5a.5.5 0 011 0V5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect
      x="10"
      y="10"
      width="11"
      height="9"
      rx="1.5"
      fill="var(--background)"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M10 13h11M15.5 10v9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

function AddToCalendarButton({ event }) {
  const [open, setOpen] = useState(false)
  const [downloaded, setDownloaded] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleICS(type) {
    downloadICS(event)
    setDownloaded(type)
    setTimeout(() => setDownloaded(null), 2500)
    setOpen(false)
  }

  function handleGoogle() {
    window.open(getGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <div className="atcb-wrapper" ref={ref}>
      <button
        className={`atcb-trigger ${open ? 'atcb-trigger--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Adicionar ao calendário"
      >
        <CalendarPlus size={16} className="atcb-trigger-icon" />
        <span>Adicionar ao Calendário</span>
        <ChevronDown size={14} className="atcb-chevron" />
      </button>

      <div className={`atcb-dropdown ${open ? 'atcb-dropdown--open' : ''}`} role="menu">
        <div className="atcb-dropdown-inner">
          <button className="atcb-option" role="menuitem" onClick={handleGoogle}>
            <span className="atcb-option-icon atcb-option-icon--google">
              <GoogleCalendarIcon />
            </span>
            <span className="atcb-option-text">
              <span className="atcb-option-name">Google Calendar</span>
              <span className="atcb-option-hint">Abre no navegador</span>
            </span>
            <ExternalLink size={12} className="atcb-option-arrow" />
          </button>

          <button className="atcb-option" role="menuitem" onClick={() => handleICS('apple')}>
            <span className="atcb-option-icon atcb-option-icon--apple">
              <AppleIcon />
            </span>
            <span className="atcb-option-text">
              <span className="atcb-option-name">Apple / iCal</span>
              <span className="atcb-option-hint">Baixa arquivo .ics</span>
            </span>
            {downloaded === 'apple' ? (
              <Check size={12} className="atcb-option-arrow atcb-option-arrow--done" />
            ) : (
              <Download size={12} className="atcb-option-arrow" />
            )}
          </button>

          <button className="atcb-option" role="menuitem" onClick={() => handleICS('outlook')}>
            <span className="atcb-option-icon atcb-option-icon--outlook">
              <OutlookIcon />
            </span>
            <span className="atcb-option-text">
              <span className="atcb-option-name">Outlook</span>
              <span className="atcb-option-hint">Baixa arquivo .ics</span>
            </span>
            {downloaded === 'outlook' ? (
              <Check size={12} className="atcb-option-arrow atcb-option-arrow--done" />
            ) : (
              <Download size={12} className="atcb-option-arrow" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddToCalendarButton
