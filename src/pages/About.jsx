import { Target, Zap, Globe, Handshake } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './About.css'

function About() {
  return (
    <div className="page-container">
      <Header />

      {/* Main Content */}
      <main className="main-content">
        {/* Secao Sobre */}
        <section className="sobre-section">
          <div className="container">
            <div className="sobre-content">
              <h2>
                Um jeito mais simples de descobrir
                <br />
                <span className="highlight">eventos de tecnologia</span>
              </h2>
              <p>
                A Comunidade Café Bugado surgiu porque encontrar eventos de tecnologia nem sempre é
                simples. As informações ficam espalhadas em vários lugares. Criamos um espaço para
                reunir tudo em um só ponto e facilitar o acesso de quem quer participar, aprender e
                se conectar com a comunidade.
              </p>

              <div className="about-stats">
                <div className="about-stat">
                  <h3>3 anos</h3>
                  <p>Conectando pessoas por meio de eventos e iniciativas da comunidade</p>
                </div>
                <div className="about-stat">
                  <h3>100%</h3>
                  <p>Eventos indicados, revisados e compartilhados pela comunidade</p>
                </div>
              </div>

              <div className="features">
                <div className="feature">
                  <div className="feature-icon">
                    <Target size={40} />
                  </div>
                  <h4>Curadoria Especializada</h4>
                  <p>
                    Os eventos são indicados por comunidades e pessoas da área. Antes de publicar,
                    avaliamos se fazem sentido para quem está começando ou já atua em tecnologia.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Zap size={40} />
                  </div>
                  <h4>Atualização em Tempo Real</h4>
                  <p>
                    As informações são atualizadas constantemente para refletir mudanças de data,
                    local ou formato dos eventos. Assim você acompanha tudo sem depender de vários
                    canais diferentes.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Globe size={40} />
                  </div>
                  <h4>Diversidade de Categorias</h4>
                  <p>
                    Reunimos eventos de diferentes formatos e temas dentro da tecnologia. De
                    encontros para iniciantes a eventos mais técnicos, presenciais ou online.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Handshake size={40} />
                  </div>
                  <h4>Comunidade Ativa</h4>
                  <p>
                    Conecte-se com pessoas que participam ativamente da comunidade de tecnologia.
                    Aqui você encontra quem aprende, compartilha eventos, troca experiências e ajuda
                    outros a crescer na área.
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
