import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, CalendarDays, ArrowUpRight } from 'lucide-react'
import { getEventById } from '../services/eventService'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingMenu from '../components/FloatingMenu'
import RichText from '../components/RichText'
import SEOHead from '../components/SEOHead'
import BgEventos from '../../public/eventos.png'
import './EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEventById(id)
        setEvent(eventData)
      } catch (err) {
        console.error('Erro ao carregar evento:', err)
        setError('Evento nao encontrado')
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  if (loading) {
    return (
      <div className="event-details-page">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando evento...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <Header />
        <div className="error-container">
          <h2>Evento nao encontrado</h2>
          <p>O evento que voce esta procurando nao existe ou foi removido.</p>
          <button onClick={() => navigate('/eventos')} className="back-button">
            <ArrowLeft size={18} />
            Voltar para Eventos
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="event-details-page">
      <SEOHead
        title={event.nome}
        description={event.descricao}
        image={event.imagem || BgEventos}
        url={`${window.location.origin}/eventos/${event.id}`}
        type="article"
        article={{
          publishedTime: event.created_at,
        }}
      />
      <Header />

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
                  <RichText content={event.descricao} />
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
                    <span className="info-label">Horario</span>
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

      <Footer />
      <FloatingMenu />
    </div>
  )
}

export default EventDetails
