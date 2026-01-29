import { useNavigate } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-content">
            <h1>
              Eventos de <span className="highlight">Tecnologia</span> em um so lugar
            </h1>

            <p className="home-description">
              Somos um hub de divulgacao de eventos criados por comunidades e empresas de
              tecnologia. Nao organizamos eventos — apenas compartilhamos as melhores oportunidades
              para voce se conectar, aprender e crescer na area de desenvolvimento e tecnologia.
            </p>

            <div className="home-features">
              <div className="home-feature">
                <span className="feature-code">{'</>'}</span>
                <span>Meetups & Workshops</span>
              </div>
              <div className="home-feature">
                <span className="feature-code">{'{ }'}</span>
                <span>Hackathons</span>
              </div>
              <div className="home-feature">
                <span className="feature-code">{'#'}</span>
                <span>Conferencias</span>
              </div>
            </div>

            <div className="home-info-box">
              <div className="info-icon">
                <Info size={20} />
              </div>
              <p>
                <strong>Como funciona:</strong> Reunimos eventos de diversas comunidades e empresas
                de tecnologia em uma unica plataforma. Cada evento e organizado por terceiros — nos
                apenas facilitamos a descoberta para voce nao perder nenhuma oportunidade.
              </p>
            </div>

            <button className="home-cta" onClick={() => navigate('/eventos')}>
              Ver Eventos
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
