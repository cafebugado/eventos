import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, CalendarPlus, Sparkles } from 'lucide-react'
import { useRealtimeEvents } from '../hooks/useRealtimeEvents'
import BgEventos from '../assets/eventos.png'
import './NewEventToast.css'

const MAX_TOASTS = 3
const AUTO_DISMISS_MS = 8000

function ToastItem({ toast, onDismiss }) {
  const navigate = useNavigate()
  const [exiting, setExiting] = useState(false)

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }, [toast.id, onDismiss])

  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [dismiss])

  return (
    <div
      className={`net-toast ${exiting ? 'net-toast--exit' : 'net-toast--enter'}`}
      role="alert"
      aria-live="polite"
    >
      <div className="net-toast-accent" />

      <div className="net-toast-header">
        <span className="net-toast-label">
          <Sparkles size={11} />
          Novo evento
        </span>
        <button className="net-toast-close" onClick={dismiss} aria-label="Fechar notificação">
          <X size={14} />
        </button>
      </div>

      <div className="net-toast-body">
        <div className="net-toast-thumb">
          <img
            src={toast.imagem || BgEventos}
            alt={toast.nome}
            onError={(e) => {
              e.target.src = BgEventos
            }}
          />
        </div>
        <div className="net-toast-info">
          <p className="net-toast-name">{toast.nome}</p>
          <p className="net-toast-meta">
            {toast.data_evento}
            {toast.horario ? ` · ${toast.horario}` : ''}
          </p>
        </div>
      </div>

      <button
        className="net-toast-cta"
        onClick={() => {
          navigate(`/eventos/${toast.slug || toast.id}`)
          dismiss()
        }}
      >
        <CalendarPlus size={13} />
        Ver evento
      </button>

      <div className="net-toast-progress">
        <div className="net-toast-progress-bar" style={{ '--duration': `${AUTO_DISMISS_MS}ms` }} />
      </div>
    </div>
  )
}

export function NewEventToastContainer() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((event) => {
    setToasts((prev) => {
      const next = [{ ...event, _toastId: `${event.id}-${Date.now()}` }, ...prev]
      return next.slice(0, MAX_TOASTS)
    })
  }, [])

  const dismiss = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t._toastId !== toastId))
  }, [])

  useRealtimeEvents(addToast)

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="net-container" aria-label="Notificações de novos eventos">
      {toasts.map((t) => (
        <ToastItem
          key={t._toastId}
          toast={{ ...t, id: t.id }}
          onDismiss={() => dismiss(t._toastId)}
        />
      ))}
    </div>
  )
}
