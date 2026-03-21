import { MapPin } from 'lucide-react'

function EventLocation({ endereco, cidade, estado, modalidade }) {
  if (modalidade === 'Online' || (!endereco && !cidade)) {
    return null
  }

  const locationParts = [endereco, cidade, estado].filter(Boolean)
  const mapsQuery = encodeURIComponent(locationParts.join(', '))

  return (
    <div className="event-location">
      <div className="location-info">
        <MapPin size={20} />
        <div className="location-text">
          {endereco && <span className="location-address">{endereco}</span>}
          {(cidade || estado) && (
            <span className="location-city">{[cidade, estado].filter(Boolean).join(' - ')}</span>
          )}
        </div>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className="location-map-link"
      >
        <MapPin size={16} />
        Ver no Google Maps
      </a>
    </div>
  )
}

export default EventLocation
