import { Calendar, Users, Images } from 'lucide-react'
import './GalleryEventCard.css'

function GalleryEventCard({ event, onPhotoClick }) {
  const previewPhotos = event.photos.slice(0, 4)
  const remainingCount = event.photos.length - 4

  return (
    <article className="gec-card">
      <header className="gec-header">
        <div className="gec-event-info">
          <h2 className="gec-event-name">{event.eventName}</h2>
          <div className="gec-meta">
            <span className="gec-meta-item">
              <Calendar size={14} />
              {event.eventDate}
            </span>
            <span className="gec-meta-item">
              <Users size={14} />
              {event.community}
            </span>
            <span className="gec-meta-item">
              <Images size={14} />
              {event.photos.length} foto{event.photos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      <div className="gec-photo-preview">
        {previewPhotos.map((photo, index) => {
          const isLast = index === 3 && remainingCount > 0
          return (
            <button
              key={photo.id}
              className="gec-photo-thumb"
              onClick={() => onPhotoClick(event, index)}
              aria-label={`Ver foto: ${photo.caption}`}
            >
              <img src={photo.thumb} alt={photo.caption} loading="lazy" />
              {isLast && (
                <div className="gec-photo-overlay">
                  <span>+{remainingCount}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <footer className="gec-footer">
        <span className="gec-last-poster">
          Última postagem por <strong>{event.photos.at(-1).postedBy}</strong>
        </span>
      </footer>
    </article>
  )
}

export default GalleryEventCard
