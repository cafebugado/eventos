import { useState, useEffect } from 'react'
import {
  Target,
  Zap,
  Globe,
  Handshake,
  Github,
  Linkedin,
  ExternalLink,
  BookOpen,
  Heart,
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingMenu from '../components/FloatingMenu'
import SEOHead from '../components/SEOHead'
import { getContributors } from '../services/contributorService'
import './About.css'

function About() {
  const [contributors, setContributors] = useState([])
  const [loadingContributors, setLoadingContributors] = useState(true)

  useEffect(() => {
    async function loadContributors() {
      try {
        const data = await getContributors()
        setContributors(data)
      } catch (error) {
        console.error('Erro ao carregar contribuintes:', error)
      } finally {
        setLoadingContributors(false)
      }
    }

    loadContributors()
  }, [])

  return (
    <div className="page-container">
      <SEOHead
        title="Sobre"
        description="Conheca a Comunidade Cafe Bugado. Um jeito mais simples de descobrir eventos de tecnologia. Reunimos meetups, workshops, hackathons e conferencias em um so lugar."
        url={`${window.location.origin}/sobre`}
      />
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
                <div className="feature">
                  <div className="feature-icon">
                    <BookOpen size={40} />
                  </div>
                  <h4>Conteúdo Acessível</h4>
                  <p>
                    Acreditamos que o conhecimento deve ser para todos. Priorizamos eventos
                    gratuitos e acessíveis, para que qualquer pessoa possa aprender e se desenvolver
                    na área de tecnologia.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Heart size={40} />
                  </div>
                  <h4>Projeto Colaborativo</h4>
                  <p>
                    Mantido por voluntários apaixonados por tecnologia. Qualquer pessoa pode sugerir
                    eventos, contribuir com melhorias e ajudar a fortalecer o ecossistema tech da
                    comunidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Secao Contribuintes */}
            <div className="contributors-section">
              <h2>
                Quem mantém este <span className="highlight">projeto</span>
              </h2>
              <p className="contributors-description">
                Este projeto é feito pela comunidade. Conheça as pessoas que contribuem para manter
                esta plataforma funcionando e sempre melhorando.
              </p>

              {loadingContributors ? (
                <div className="contributors-loading">
                  <div className="contributors-grid">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="contributor-card-skeleton">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-name"></div>
                        <div className="skeleton-links"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : contributors.length === 0 ? (
                <p className="contributors-empty">Nenhum contribuinte cadastrado ainda.</p>
              ) : (
                <div className="contributors-grid">
                  {contributors.map((contributor) => (
                    <div key={contributor.id} className="contributor-card">
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.nome}
                        className="contributor-avatar"
                      />
                      <h4 className="contributor-name">{contributor.nome}</h4>
                      <div className="contributor-links">
                        <a
                          href={contributor.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contributor-link contributor-link-github"
                          title={`GitHub de ${contributor.nome}`}
                        >
                          <Github size={18} />
                        </a>
                        {contributor.linkedin_url && (
                          <a
                            href={contributor.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link contributor-link-linkedin"
                            title={`LinkedIn de ${contributor.nome}`}
                          >
                            <Linkedin size={18} />
                          </a>
                        )}
                        {contributor.portfolio_url && (
                          <a
                            href={contributor.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link contributor-link-portfolio"
                            title={`Portfólio de ${contributor.nome}`}
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingMenu />
    </div>
  )
}

export default About
