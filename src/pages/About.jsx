import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, Zap, Globe, Handshake } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './About.css'

function About() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <Header />

      {/* Main Content */}
      <main className="main-content" style={{ paddingTop: '6rem' }}>
        <div className="back-to-home">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} />
            <span>Voltar ao Inicio</span>
          </button>
        </div>

        {/* Secao Sobre */}
        <section className="sobre-section">
          <div className="container">
            <div className="sobre-content">
              <div className="section-badge">Nossa Missao</div>
              <h2>
                Transformando a forma como voce <span className="highlight">descobre eventos</span>
              </h2>
              <p>
                A Comunidade Cafe Bugado nasceu da necessidade de centralizar e simplificar a
                descoberta de eventos. Acreditamos que experiencias memoraveis acontecem quando as
                pessoas certas se encontram nos lugares certos, no momento certo.
              </p>

              <div className="about-stats">
                <div className="about-stat">
                  <h3>3 anos</h3>
                  <p>Conectando pessoas atraves de eventos</p>
                </div>
                <div className="about-stat">
                  <h3>100%</h3>
                  <p>Eventos verificados e de qualidade</p>
                </div>
              </div>

              <div className="features">
                <div className="feature">
                  <div className="feature-icon">
                    <Target size={40} />
                  </div>
                  <h4>Curadoria Especializada</h4>
                  <p>
                    Cada evento passa por um processo rigoroso de selecao, garantindo qualidade e
                    relevancia para nossa comunidade.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Zap size={40} />
                  </div>
                  <h4>Atualizacao em Tempo Real</h4>
                  <p>
                    Nossa plataforma e sincronizada automaticamente, garantindo que voce sempre
                    tenha acesso as informacoes mais recentes.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Globe size={40} />
                  </div>
                  <h4>Diversidade de Categorias</h4>
                  <p>
                    De tecnologia a arte, de negocios a entretenimento. Temos eventos para todos os
                    interesses e momentos da vida.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Handshake size={40} />
                  </div>
                  <h4>Comunidade Ativa</h4>
                  <p>
                    Conecte-se com pessoas que compartilham seus interesses e construa uma rede de
                    contatos valiosa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About
