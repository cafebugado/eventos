import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Sun,
  Moon,
  Home,
  ArrowLeft,
  Calendar,
  Clock,
  CalendarDays,
  ArrowUpRight,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { getEventById } from '../services/eventService'
import BgEventos from '../../public/eventos.png'
import './EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    async function loadEvent() {
      try {
        const eventData = await getEventById(id)
        setEvent(eventData)
      } catch (err) {
        console.error('Erro ao carregar evento:', err)
        setError('Evento não encontrado')
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando evento...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="error-container">
          <h2>Evento não encontrado</h2>
          <p>O evento que você está procurando não existe ou foi removido.</p>
          <button onClick={() => navigate('/eventos')} className="back-button">
            <ArrowLeft size={18} />
            Voltar para Eventos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="event-details-page">
      <header className="details-header">
        <div className="header-container">
          <div className="logo">
            <a
              href="https://cafebugado.com.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h1>Eventos</h1>
              <span>Comunidade Café Bugado</span>
            </a>
          </div>
          <nav className="details-nav">
            <button onClick={() => navigate('/')}>
              <Home size={16} style={{ marginRight: '0.25rem' }} />
              Início
            </button>
            <button onClick={() => navigate('/eventos')}>Eventos</button>
          </nav>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="details-main">
        <div className="details-container">
          <button onClick={() => navigate('/eventos')} className="back-link">
            <ArrowLeft size={18} />
            <span>Voltar para Eventos</span>
          </button>

          <div className="event-details-card">
            <div className="event-image-container">
              <img src={event.imagem || BgEventos} alt={event.nome} />
              <div className="event-badge">{event.periodo}</div>
            </div>

            <div className="event-details-content">
              <h1>{event.nome}</h1>

              {event.descricao && (
                <div className="event-description-full">
                  <p>{event.descricao}</p>
                </div>
              )}

              <div className="event-info-grid">
                <div className="info-card">
                  <div className="info-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Data</span>
                    <span className="info-value">{event.data_evento}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Clock size={24} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Horário</span>
                    <span className="info-value">{event.horario}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <CalendarDays size={24} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Dia da Semana</span>
                    <span className="info-value">{event.dia_semana}</span>
                  </div>
                </div>
              </div>

              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="participate-button"
              >
                Participar do Evento
                <ArrowUpRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EventDetails
