import { useNavigate } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingMenu from '../components/FloatingMenu'
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
              Eventos de <span className="highlight">tecnologia</span> em um só lugar
            </h1>

            <p className="home-description">
              Este é um espaço feito por e para a comunidade. Reunimos eventos de tecnologia criados
              por comunidades e empresas para facilitar o acesso de quem quer aprender, trocar ideia
              e conhecer pessoas da área. Aqui você encontra oportunidades para participar,
              contribuir e crescer junto com outras pessoas que vivem tecnologia no dia a dia.
            </p>

            <div className="home-features">
              <div className="home-feature">
                <span className="feature-code">{'</>'}</span>
                <span>Meetups e Workshops</span>
              </div>
              <div className="home-feature">
                <span className="feature-code">{'{ }'}</span>
                <span>Hackathons</span>
              </div>
              <div className="home-feature">
                <span className="feature-code">{'#'}</span>
                <span>Conferências</span>
              </div>
            </div>

            <div className="home-info-box">
              <div className="info-icon">
                <Info size={20} />
              </div>
              <div>
                <p>
                  <strong>Como funciona</strong>
                </p>
                <p>
                  A comunidade indica eventos e nós reunimos tudo em um só lugar. Os eventos são
                  organizados por terceiros. Nosso papel é ajudar na divulgação e facilitar a
                  descoberta para que ninguém fique de fora.
                </p>
              </div>
            </div>

            <button className="home-cta" onClick={() => navigate('/eventos')}>
              Ver eventos da comunidade
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingMenu />
    </div>
  )
}

export default Home
