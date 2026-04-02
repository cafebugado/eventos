import React from 'react'
function EventCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text short" />
        <div className="skeleton-info-grid">
          <div className="skeleton-info" />
          <div className="skeleton-info" />
          <div className="skeleton-info" />
        </div>
        <div className="skeleton-button" />
      </div>
    </div>
  )
}
export default EventCardSkeleton
