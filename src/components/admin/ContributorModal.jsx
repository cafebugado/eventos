import React from 'react'
import { X, Github, Loader2, Search, Users, Linkedin, ExternalLink, Save } from 'lucide-react'
import {
  isValidGitHubUsername,
  isValidPortfolioUrl,
  isValidLinkedInUrl,
} from '../../services/contributorService'

const ContributorModal = ({
  closeContributorModal,
  handleSubmitContributor,
  fetchGitHub,
  onSubmitContributor,
  registerContributor,
  isEditingContributor,
  isFetchingGitHub,
  isSubmittingContributor,
  contributorErrors,
  gitHubPreview,
}) => {
  return (
    <div className="modal-overlay" onClick={closeContributorModal}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditingContributor ? 'Editar Contribuinte' : 'Adicionar Contribuinte'}</h2>
          <button className="modal-close" onClick={closeContributorModal}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmitContributor(onSubmitContributor)} className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>
                <Github size={16} />
                Username do GitHub
              </label>
              <div className="github-search-row">
                <input
                  type="text"
                  placeholder="Ex: octocat"
                  {...registerContributor('github_username', {
                    required: 'Username do GitHub é obrigatório',
                    validate: (value) =>
                      isValidGitHubUsername(value) || 'Username do GitHub inválido',
                  })}
                />
                <button
                  type="button"
                  className="btn-primary btn-fetch-github"
                  onClick={() => {
                    const input = document.querySelector('input[name="github_username"]')
                    if (input) {
                      fetchGitHub(input.value)
                    }
                  }}
                  disabled={isFetchingGitHub}
                >
                  {isFetchingGitHub ? (
                    <Loader2 size={16} className="spinning" />
                  ) : (
                    <Search size={16} />
                  )}
                  Buscar
                </button>
              </div>
              {contributorErrors.github_username && (
                <span className="field-error">{contributorErrors.github_username.message}</span>
              )}
            </div>
          </div>

          {gitHubPreview && (
            <div className="github-preview">
              <img
                src={gitHubPreview.avatar_url}
                alt={gitHubPreview.nome}
                className="github-preview-avatar"
              />
              <div className="github-preview-info">
                <span className="github-preview-name">{gitHubPreview.nome}</span>
                <span className="github-preview-username">@{gitHubPreview.github_username}</span>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-field">
              <label>
                <Users size={16} />
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="Nome do contribuinte (preenchido pelo GitHub)"
                {...registerContributor('nome', { required: 'Nome é obrigatório' })}
              />
              {contributorErrors.nome && (
                <span className="field-error">{contributorErrors.nome.message}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <Linkedin size={16} />
                LinkedIn (opcional)
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/usuario"
                {...registerContributor('linkedin_url', {
                  validate: (value) =>
                    !value ||
                    isValidLinkedInUrl(value) ||
                    'URL do LinkedIn inválida. Use: https://linkedin.com/in/usuario',
                })}
              />
              {contributorErrors.linkedin_url && (
                <span className="field-error">{contributorErrors.linkedin_url.message}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <ExternalLink size={16} />
                Portfólio (opcional)
              </label>
              <input
                type="url"
                placeholder="https://meusite.com"
                {...registerContributor('portfolio_url', {
                  validate: (value) =>
                    !value ||
                    isValidPortfolioUrl(value) ||
                    'URL do portfólio inválida. Use uma URL válida com https://',
                })}
              />
              {contributorErrors.portfolio_url && (
                <span className="field-error">{contributorErrors.portfolio_url.message}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeContributorModal}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmittingContributor || !gitHubPreview}
            >
              {isSubmittingContributor ? (
                <>
                  <span className="button-spinner"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditingContributor ? 'Salvar Alterações' : 'Adicionar Contribuinte'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContributorModal
