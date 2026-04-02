import React from 'react'
function EventDetailSkeleton() {
  return (
    <div className="event-details-page">
      <main className="details-main">
        <div className="details-container">
          <div className="skeleton-back-button"></div>
          <div
            className="skeleton-detail-card"
            role="status"
            aria-busy="true"
            aria-label="Carregando detalhes do evento"
          >
            <div className="skeleton-detail-image"></div>
            <div className="skeleton-detail-content">
              <div className="skeleton-detail-title"></div>
              <div className="skeleton-detail-description">
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
              <div className="skeleton-detail-info-grid">
                <div className="skeleton-info-card"></div>
                <div className="skeleton-info-card"></div>
                <div className="skeleton-info-card"></div>
              </div>
              <div className="skeleton-button large"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export default EventDetailSkeleton
