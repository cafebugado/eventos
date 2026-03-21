import { Calendar, Users, Images } from 'lucide-react'
import './GalleryEventCard.css'

function GalleryEventCard({ event, onPhotoClick }) {
  const firstPhoto = event.photos[0]

  return (
    <article className="gec-card" onClick={() => onPhotoClick(event, 0)}>
      <div className="gec-cover">
        <img src={firstPhoto.url} alt={firstPhoto.caption || event.eventName} loading="lazy" />
      </div>

      <div className="gec-body">
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

      <footer className="gec-footer">
        <span className="gec-last-poster">
          Postado por <strong>{event.createdBy || 'Desconhecido'}</strong>
          {event.photos.at(-1)?.postedAt && (
            <>
              {' '}
              em <strong>{event.photos.at(-1).postedAt}</strong>
            </>
          )}
        </span>
      </footer>
    </article>
  )
}

export default GalleryEventCard
