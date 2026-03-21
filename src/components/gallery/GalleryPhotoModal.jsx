import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, User, Calendar, Images } from 'lucide-react'
import './GalleryPhotoModal.css'

function GalleryPhotoModal({ event, photoIndex, onClose, onPrev, onNext }) {
  const photo = event?.photos[photoIndex]
  const hasPrev = photoIndex > 0
  const hasNext = photoIndex < event?.photos.length - 1

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev()
      }
      if (e.key === 'ArrowRight' && hasNext) {
        onNext()
      }
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!photo) {
    return null
  }

  return (
    <div
      className="gpm-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto: ${photo.caption}`}
    >
      <div className="gpm-container" onClick={(e) => e.stopPropagation()}>
        {/* Barra superior */}
        <div className="gpm-topbar">
          <div className="gpm-event-label">
            <Images size={15} />
            <span>{event.eventName}</span>
            <span className="gpm-counter">
              {photoIndex + 1} / {event.photos.length}
            </span>
          </div>
          <button className="gpm-close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Imagem principal */}
        <div className="gpm-image-area">
          <button
            className={`gpm-nav gpm-nav-prev ${!hasPrev ? 'gpm-nav-disabled' : ''}`}
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={28} />
          </button>

          <img key={photo.id} src={photo.url} alt={photo.caption} className="gpm-image" />

          <button
            className={`gpm-nav gpm-nav-next ${!hasNext ? 'gpm-nav-disabled' : ''}`}
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Próxima foto"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Informações da foto */}
        <div className="gpm-info">
          <p className="gpm-caption">{photo.caption}</p>
          <div className="gpm-poster-details">
            <span className="gpm-poster-item">
              <User size={14} />
              Postado por <strong>{photo.postedBy}</strong>
            </span>
            <span className="gpm-poster-item">
              <Calendar size={14} />
              {photo.postedAt}
            </span>
          </div>
        </div>

        {/* Miniaturas */}
        <div className="gpm-thumbnails">
          {event.photos.map((p, idx) => (
            <button
              key={p.id}
              className={`gpm-thumb ${idx === photoIndex ? 'gpm-thumb-active' : ''}`}
              onClick={() => {
                if (idx < photoIndex) {
                  onPrev(idx)
                } else if (idx > photoIndex) {
                  onNext(idx)
                }
              }}
              aria-label={`Ir para foto ${idx + 1}`}
            >
              <img src={p.thumb} alt={p.caption} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GalleryPhotoModal
