import { useState, useEffect } from 'react'
import { Github, Linkedin, ExternalLink } from 'lucide-react'
import { getContributors } from '../services/contributorService'
import ContributorSkeleton from './skeletons/ContributorsSkeleton'
function ContributorsGrid() {
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
    <div className="contributors-section">
      <h2>
        Quem mantém este <span className="highlight">projeto</span>
      </h2>
      <p className="contributors-description">
        Este projeto é feito pela comunidade. Conheça as pessoas que contribuem para manter esta
        plataforma funcionando e sempre melhorando.
      </p>

      {loadingContributors ? (
        <div className="contributors-loading">
          <div className="contributors-grid">
            {[1, 2, 3].map((i) => (
              <ContributorSkeleton key={`contributor-skeleton-${i}`} />
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
  )
}
export default ContributorsGrid
