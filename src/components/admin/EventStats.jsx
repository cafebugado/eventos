import React from 'react'
import { Calendar, CheckCircle, Sun } from 'lucide-react'

const EventStats = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue">
          <Calendar size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total de Eventos</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon green">
          <CheckCircle size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{stats.noturno}</span>
          <span className="stat-label">Eventos Noturnos</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon orange">
          <Sun size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{stats.diurno}</span>
          <span className="stat-label">Eventos Diurnos</span>
        </div>
      </div>
    </div>
  )
}

export default EventStats
