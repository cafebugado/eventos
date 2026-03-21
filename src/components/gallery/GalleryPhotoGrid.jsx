import { User, Calendar } from 'lucide-react'
import './GalleryPhotoGrid.css'

function GalleryPhotoGrid({ photos, onPhotoClick }) {
  return (
    <div className="gpg-grid">
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          className="gpg-item"
          onClick={() => onPhotoClick(index)}
          aria-label={`Abrir foto: ${photo.caption}`}
        >
          <img src={photo.thumb} alt={photo.caption} loading="lazy" />
          <div className="gpg-overlay">
            <p className="gpg-caption">{photo.caption}</p>
            <div className="gpg-poster-info">
              <span className="gpg-poster-meta">
                <User size={12} />
                {photo.postedBy}
              </span>
              <span className="gpg-poster-meta">
                <Calendar size={12} />
                {photo.postedAt}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default GalleryPhotoGrid
