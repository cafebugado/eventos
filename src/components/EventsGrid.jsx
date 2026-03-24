import { Calendar } from 'lucide-react'
import EventCard from './EventCard'
import EventRowCompact from './EventRowCompact'
import Pagination from './Pagination'
import { isEventPast, isEventToday } from '../utils/eventDate'

function SkeletonCards({ count }) {
  return (
    <div className="eventos-grid" role="status" aria-busy="true" aria-label="Carregando eventos">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skeleton-${i}`} className="skeleton-card">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-info-grid">
              <div className="skeleton-info"></div>
              <div className="skeleton-info"></div>
              <div className="skeleton-info"></div>
            </div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ hasEvents }) {
  return (
    <div className="no-events">
      <div className="empty-icon">
        <Calendar size={48} />
      </div>
      <h3>{hasEvents ? 'Nenhum evento encontrado' : 'Nenhum evento no momento'}</h3>
      <p>
        {hasEvents
          ? 'Tente ajustar os filtros de busca.'
          : 'Estamos preparando eventos incriveis para voce. Volte em breve!'}
      </p>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="error-container" role="alert" aria-live="polite">
      <div className="error-icon">
        <Calendar size={48} />
      </div>
      <h3>Erro ao carregar eventos</h3>
      <p>Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.</p>
      <button onClick={onRetry} className="retry-button">
        Tentar novamente
      </button>
    </div>
  )
}

export default function EventsGrid({
  loading,
  error,
  onRetry,
  filteredEvents,
  totalEvents,
  viewMode,
  pageSize,
  eventTagsMap,
  favouriteIds,
  toggleFavourite,
}) {
  if (loading) {
    return <SkeletonCards count={pageSize} />
  }
  if (error) {
    return <ErrorState onRetry={onRetry} />
  }
  if (filteredEvents.length === 0) {
    return <EmptyState hasEvents={totalEvents > 0} />
  }

  return (
    <>
      {viewMode === 'compact' ? (
        <div className="eventos-compact">
          {filteredEvents.map((item, index) => (
            <EventRowCompact
              key={item.id || `event-${index}`}
              event={item}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      ) : (
        <div className={viewMode === 'list' ? 'eventos-list' : 'eventos-grid'}>
          {filteredEvents.map((item, index) => (
            <EventCard
              key={item.id || `event-${index}`}
              event={item}
              tags={eventTagsMap[item.id] || []}
              variant="full"
              isPast={isEventPast(item.data_evento)}
              isToday={isEventToday(item.data_evento)}
              showLocation
              showActionButton
              style={{ animationDelay: `${index * 0.1}s` }}
              favouriteIds={favouriteIds}
              toggleFavourite={toggleFavourite}
            />
          ))}
        </div>
      )}
    </>
  )
}
