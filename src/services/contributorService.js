import { supabase } from '../lib/supabase'

const GITHUB_API_URL = 'https://api.github.com/users'

// Buscar informações do GitHub pelo username
export async function fetchGitHubUser(username) {
  const response = await fetch(`${GITHUB_API_URL}/${encodeURIComponent(username)}`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Usuário do GitHub não encontrado')
    }
    throw new Error('Erro ao buscar dados do GitHub')
  }

  const data = await response.json()

  return {
    github_username: data.login,
    nome: data.name || data.login,
    avatar_url: data.avatar_url,
    github_url: data.html_url,
  }
}

// Buscar todos os contribuintes
export async function getContributors() {
  const { data, error } = await supabase
    .from('contribuintes')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar contribuintes:', error)
    throw error
  }

  return data
}

// Buscar contribuinte por ID
export async function getContributorById(id) {
  const { data, error } = await supabase.from('contribuintes').select('*').eq('id', id).single()

  if (error) {
    console.error('Erro ao buscar contribuinte:', error)
    throw error
  }

  return data
}

// Criar novo contribuinte
export async function createContributor(contributor) {
  const { data, error } = await supabase
    .from('contribuintes')
    .insert([
      {
        github_username: contributor.github_username,
        nome: contributor.nome,
        avatar_url: contributor.avatar_url,
        github_url: contributor.github_url,
        linkedin_url: contributor.linkedin_url || null,
        portfolio_url: contributor.portfolio_url || null,
      },
    ])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este usuário do GitHub já está cadastrado como contribuinte')
    }
    console.error('Erro ao criar contribuinte:', error)
    throw error
  }

  return data
}

// Atualizar contribuinte
export async function updateContributor(id, contributor) {
  const { data, error } = await supabase
    .from('contribuintes')
    .update({
      github_username: contributor.github_username,
      nome: contributor.nome,
      avatar_url: contributor.avatar_url,
      github_url: contributor.github_url,
      linkedin_url: contributor.linkedin_url || null,
      portfolio_url: contributor.portfolio_url || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar contribuinte:', error)
    throw error
  }

  return data
}

// Deletar contribuinte
export async function deleteContributor(id) {
  const { error } = await supabase.from('contribuintes').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar contribuinte:', error)
    throw error
  }

  return true
}

// Validar URL do LinkedIn
export function isValidLinkedInUrl(url) {
  if (!url) {
    return true
  }
  return /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(url)
}

// Validar URL de portfólio
export function isValidPortfolioUrl(url) {
  if (!url) {
    return true
  }
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

// Validar username do GitHub
export function isValidGitHubUsername(username) {
  if (!username) {
    return false
  }
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)
}
