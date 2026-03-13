import { useState, useEffect, useCallback } from 'react'
import {
  GitBranch,
  Star,
  GitFork,
  AlertCircle,
  GitCommitHorizontal,
  GitPullRequest,
  Users,
  ExternalLink,
  RefreshCw,
  CircleDot,
  GitMerge,
  XCircle,
  Monitor,
  Server,
} from 'lucide-react'
import {
  getRepoStats,
  getRecentCommits,
  getRecentPRs,
  getTopContributors,
} from '../services/githubService'
import './GithubStats.css'

const REPOS = [
  {
    id: 'frontend',
    label: 'Frontend',
    repo: import.meta.env.VITE_GITHUB_REPO || 'cafebugado/agendas_eventos',
    icon: Monitor,
  },
  {
    id: 'backend',
    label: 'Backend',
    repo: import.meta.env.VITE_GITHUB_REPO_BACKEND || 'cafebugado/backendEventos',
    icon: Server,
  },
]

function formatRelativeDate(dateStr) {
  if (!dateStr) {
    return ''
  }
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) {
    return `${minutes}min atrás`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h atrás`
  }
  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days}d atrás`
  }
  const months = Math.floor(days / 30)
  return `${months}m atrás`
}

function PRBadge({ state }) {
  if (state === 'merged') {
    return (
      <span className="gh-pr-badge gh-pr-badge--merged">
        <GitMerge size={12} /> merged
      </span>
    )
  }
  if (state === 'open') {
    return (
      <span className="gh-pr-badge gh-pr-badge--open">
        <CircleDot size={12} /> open
      </span>
    )
  }
  return (
    <span className="gh-pr-badge gh-pr-badge--closed">
      <XCircle size={12} /> closed
    </span>
  )
}

function Skeleton({ width = '100%', height = 16, style = {} }) {
  return <div className="gh-skeleton" style={{ width, height, ...style }} />
}

const stopProp = (e) => e.stopPropagation()

function RepoPanel({ repo }) {
  const [repoStats, setRepoStats] = useState(null)
  const [commits, setCommits] = useState([])
  const [prs, setPrs] = useState([])
  const [contributors, setContributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [stats, recentCommits, recentPRs, topContributors] = await Promise.all([
        getRepoStats(repo),
        getRecentCommits(5, repo),
        getRecentPRs(5, repo),
        getTopContributors(5, repo),
      ])
      setRepoStats(stats)
      setCommits(recentCommits)
      setPrs(recentPRs)
      setContributors(topContributors)
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do GitHub')
    } finally {
      setLoading(false)
    }
  }, [repo])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (error) {
    return (
      <div className="gh-error">
        <AlertCircle size={20} />
        <span>{error}</span>
        <button type="button" className="gh-refresh-btn" onClick={loadAll}>
          <RefreshCw size={16} /> Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Stats bar */}
      <div className="gh-stats-bar">
        {loading ? (
          <>
            <Skeleton width={80} />
            <Skeleton width={80} />
            <Skeleton width={80} />
            <Skeleton width={120} />
          </>
        ) : repoStats ? (
          <>
            <a
              href={repoStats.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-repo-link"
              onClick={stopProp}
            >
              {repo} <ExternalLink size={13} />
            </a>
            <span className="gh-stats-bar-divider" />
            <span className="gh-stat">
              <Star size={15} />
              <strong>{repoStats.stars}</strong> stars
            </span>
            <span className="gh-stat">
              <GitFork size={15} />
              <strong>{repoStats.forks}</strong> forks
            </span>
            <span className="gh-stat">
              <AlertCircle size={15} />
              <strong>{repoStats.open_issues}</strong> issues abertas
            </span>
            {repoStats.language && (
              <span className="gh-stat gh-stat--lang">
                <span className="gh-lang-dot" />
                {repoStats.language}
              </span>
            )}
            <span className="gh-stat gh-stat--updated">
              Atualizado {formatRelativeDate(repoStats.updated_at)}
            </span>
            <button
              type="button"
              className="gh-refresh-btn gh-refresh-btn--icon gh-stats-bar-refresh"
              onClick={loadAll}
              title="Atualizar"
            >
              <RefreshCw size={15} />
            </button>
          </>
        ) : null}
      </div>

      {/* Grid principal */}
      <div className="gh-grid">
        {/* Commits recentes */}
        <div className="gh-card">
          <div className="gh-card-header">
            <GitCommitHorizontal size={16} />
            <span>Commits recentes</span>
          </div>
          <ul className="gh-list">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="gh-list-item gh-list-item--skeleton">
                    <Skeleton
                      width={32}
                      height={32}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="80%" height={14} />
                      <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
                    </div>
                  </li>
                ))
              : commits.map((commit) => (
                  <li key={commit.sha} className="gh-list-item">
                    {commit.author_avatar ? (
                      <img
                        src={commit.author_avatar}
                        alt={commit.author_login || commit.author_name}
                        className="gh-avatar gh-avatar--sm"
                      />
                    ) : (
                      <div className="gh-avatar gh-avatar--sm gh-avatar--placeholder" />
                    )}
                    <div className="gh-list-item-body">
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gh-commit-msg"
                        title={commit.message}
                        onClick={stopProp}
                      >
                        {commit.message.length > 60
                          ? commit.message.slice(0, 60) + '…'
                          : commit.message}
                      </a>
                      <span className="gh-meta">
                        <code className="gh-sha">{commit.short_sha}</code>
                        &nbsp;·&nbsp;
                        {commit.author_login ? `@${commit.author_login}` : commit.author_name}
                        &nbsp;·&nbsp;
                        {formatRelativeDate(commit.date)}
                      </span>
                    </div>
                  </li>
                ))}
          </ul>
        </div>

        {/* Pull Requests */}
        <div className="gh-card">
          <div className="gh-card-header">
            <GitPullRequest size={16} />
            <span>Pull Requests recentes</span>
          </div>
          <ul className="gh-list">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="gh-list-item gh-list-item--skeleton">
                    <Skeleton
                      width={32}
                      height={32}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="80%" height={14} />
                      <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
                    </div>
                  </li>
                ))
              : prs.map((pr) => (
                  <li key={pr.number} className="gh-list-item">
                    {pr.author_avatar ? (
                      <img
                        src={pr.author_avatar}
                        alt={pr.author_login}
                        className="gh-avatar gh-avatar--sm"
                      />
                    ) : (
                      <div className="gh-avatar gh-avatar--sm gh-avatar--placeholder" />
                    )}
                    <div className="gh-list-item-body">
                      <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gh-commit-msg"
                        title={pr.title}
                        onClick={stopProp}
                      >
                        <span className="gh-pr-number">#{pr.number}</span>{' '}
                        {pr.title.length > 55 ? pr.title.slice(0, 55) + '…' : pr.title}
                      </a>
                      <span className="gh-meta">
                        <PRBadge state={pr.state} />
                        &nbsp;·&nbsp;
                        {pr.author_login ? `@${pr.author_login}` : ''}
                        &nbsp;·&nbsp;
                        {formatRelativeDate(pr.updated_at)}
                      </span>
                    </div>
                  </li>
                ))}
          </ul>
        </div>

        {/* Top Contributors */}
        <div className="gh-card gh-card--wide">
          <div className="gh-card-header">
            <Users size={16} />
            <span>Top contribuidores</span>
          </div>
          <ul className="gh-contributors-list">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="gh-contributor gh-contributor--skeleton">
                    <Skeleton
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="60%" height={14} />
                    </div>
                    <Skeleton width={80} height={24} style={{ borderRadius: 12 }} />
                  </li>
                ))
              : contributors.map((c, i) => (
                  <li key={c.login} className="gh-contributor">
                    <span className="gh-contributor-rank">#{i + 1}</span>
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={stopProp}
                    >
                      <img src={c.avatar_url} alt={c.login} className="gh-avatar gh-avatar--md" />
                    </a>
                    <div className="gh-contributor-info">
                      <a
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gh-contributor-name"
                        onClick={stopProp}
                      >
                        @{c.login}
                      </a>
                    </div>
                    <span className="gh-contributor-commits">
                      <GitCommitHorizontal size={14} />
                      {c.contributions} commits
                    </span>
                  </li>
                ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default function GithubStats() {
  const [activeRepo, setActiveRepo] = useState(REPOS[0].id)
  const current = REPOS.find((r) => r.id === activeRepo)

  return (
    <div className="gh-panel">
      {/* Header */}
      <div className="gh-header">
        <div className="gh-header-title">
          <GitBranch size={20} />
          <h2>Repositórios GitHub</h2>
        </div>
        {/* Abas internas */}
        <div className="gh-repo-tabs">
          {REPOS.map((r) => {
            const Icon = r.icon
            return (
              <button
                key={r.id}
                type="button"
                className={`gh-repo-tab ${activeRepo === r.id ? 'gh-repo-tab--active' : ''}`}
                onClick={() => setActiveRepo(r.id)}
              >
                <Icon size={15} />
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      <RepoPanel key={current.repo} repo={current.repo} />
    </div>
  )
}
