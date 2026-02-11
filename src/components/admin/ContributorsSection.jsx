import React from 'react'
import { Plus, Users, Github, Linkedin, ExternalLink, Edit2, Trash2 } from 'lucide-react'

const ContributorsSection = ({
  onOpenCreateContributorModal,
  loadingContributors,
  contributors,
  onOpenEditContributorModal,
  handleDeleteContributor,
}) => {
  return (
    <div className="events-section">
      <div className="section-header">
        <h2>Contribuintes do Projeto</h2>
        <button
          className="btn-primary"
          onClick={onOpenCreateContributorModal}
          aria-label="Novo Contribuinte"
        >
          <Plus size={18} />
          <span className="btn-text">Novo Contribuinte</span>
        </button>
      </div>

      {loadingContributors ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando contribuintes...</p>
        </div>
      ) : contributors.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>Nenhum contribuinte cadastrado</h3>
          <p>Clique em &quot;Novo Contribuinte&quot; para adicionar o primeiro contribuinte.</p>
        </div>
      ) : (
        <div className="contributors-admin-grid">
          {contributors.map((contributor) => (
            <div key={contributor.id} className="contributor-admin-card">
              <img
                src={contributor.avatar_url}
                alt={contributor.nome}
                className="contributor-admin-avatar"
              />
              <div className="contributor-admin-info">
                <span className="contributor-admin-name">{contributor.nome}</span>
                <span className="contributor-admin-username">@{contributor.github_username}</span>
                <div className="contributor-admin-links">
                  <a
                    href={contributor.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                  >
                    <Github size={14} />
                  </a>
                  {contributor.linkedin_url && (
                    <a
                      href={contributor.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                    >
                      <Linkedin size={14} />
                    </a>
                  )}
                  {contributor.portfolio_url && (
                    <a
                      href={contributor.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Portfólio"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
              <div className="action-buttons">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => onOpenEditContributorModal(contributor)}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteContributor(contributor.id)}
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContributorsSection
