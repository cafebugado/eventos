import React from 'react'

function SkeletonRecommendations() {
  return (
    <div className="event-recs-skeleton">
      <div className="event-recs-skeleton-image" />
      <div className="event-recs-skeleton-content">
        <div className="event-recs-skeleton-title" />
        <div className="event-recs-skeleton-text" />
        <div className="event-recs-skeleton-text short" />
      </div>
    </div>
  )
}
export default SkeletonRecommendations
