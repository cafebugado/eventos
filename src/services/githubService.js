const DEFAULT_REPO = import.meta.env.VITE_GITHUB_REPO || 'cafebugado/agendas_eventos'
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN

function ghHeaders() {
  const headers = { Accept: 'application/vnd.github+json' }
  if (TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`
  }
  return headers
}

// Cache simples em memória: { key -> { data, expiresAt } }
const cache = {}
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

async function ghFetch(path, repo) {
  const cacheKey = path
  const now = Date.now()

  if (cache[cacheKey] && cache[cacheKey].expiresAt > now) {
    return cache[cacheKey].data
  }

  const response = await fetch(`https://api.github.com${path}`, { headers: ghHeaders() })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        'Limite de requisições da API do GitHub atingido. Configure VITE_GITHUB_TOKEN.'
      )
    }
    if (response.status === 404) {
      throw new Error(`Repositório "${repo}" não encontrado.`)
    }
    throw new Error(`Erro ao acessar GitHub API: ${response.status}`)
  }

  const data = await response.json()
  cache[cacheKey] = { data, expiresAt: now + CACHE_TTL_MS }
  return data
}

// Estatísticas gerais do repositório
export async function getRepoStats(repo = DEFAULT_REPO) {
  const data = await ghFetch(`/repos/${repo}`, repo)
  return {
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
    language: data.language,
    html_url: data.html_url,
    updated_at: data.updated_at,
    default_branch: data.default_branch,
  }
}

// Commits recentes
export async function getRecentCommits(n = 5, repo = DEFAULT_REPO) {
  const data = await ghFetch(`/repos/${repo}/commits?per_page=${n}`, repo)
  return data.map((item) => ({
    sha: item.sha,
    short_sha: item.sha.slice(0, 7),
    message: item.commit.message.split('\n')[0],
    author_name: item.commit.author?.name || item.author?.login || 'Desconhecido',
    author_login: item.author?.login || null,
    author_avatar: item.author?.avatar_url || null,
    date: item.commit.author?.date || null,
    html_url: item.html_url,
  }))
}

// Pull Requests recentes (abertos + fechados/mergeados)
export async function getRecentPRs(n = 5, repo = DEFAULT_REPO) {
  const data = await ghFetch(
    `/repos/${repo}/pulls?state=all&per_page=${n}&sort=updated&direction=desc`,
    repo
  )
  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.merged_at ? 'merged' : pr.state,
    author_login: pr.user?.login || null,
    author_avatar: pr.user?.avatar_url || null,
    html_url: pr.html_url,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    merged_at: pr.merged_at,
  }))
}

// Top contributors por número de commits
export async function getTopContributors(n = 5, repo = DEFAULT_REPO) {
  const data = await ghFetch(`/repos/${repo}/contributors?per_page=${n}`, repo)
  return data.map((c) => ({
    login: c.login,
    avatar_url: c.avatar_url,
    html_url: c.html_url,
    contributions: c.contributions,
  }))
}
