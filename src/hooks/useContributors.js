import { useState, useCallback } from 'react'
import {
  getContributors,
  createContributor,
  updateContributor,
  deleteContributor,
  fetchGitHubUser,
  isValidGitHubUsername,
} from '../services/contributorService'

export default function useContributors(showNotification) {
  const [contributors, setContributors] = useState([])
  const [loading, setLoading] = useState(false)
  const [gitHubPreview, setGitHubPreview] = useState(null)
  const [isFetchingGitHub, setIsFetchingGitHub] = useState(false)

  const loadContributors = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getContributors()
      setContributors(data)
    } catch (error) {
      console.error('Erro ao carregar contribuintes:', error)
      showNotification('Erro ao carregar contribuintes', 'error')
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const fetchGitHub = async (username) => {
    if (!username || !isValidGitHubUsername(username)) {
      setGitHubPreview(null)
      return
    }

    setIsFetchingGitHub(true)
    try {
      const data = await fetchGitHubUser(username)
      setGitHubPreview(data)
      return data
    } catch (error) {
      showNotification(error.message || 'Erro ao buscar usuário do GitHub', 'error')
      setGitHubPreview(null)
      throw error
    } finally {
      setIsFetchingGitHub(false)
    }
  }

  const saveContributor = async (id, data) => {
    if (id) {
      await updateContributor(id, data)
    } else {
      await createContributor(data)
    }
    await loadContributors()
  }

  const deleteContributorById = async (id) => {
    await deleteContributor(id)
    await loadContributors()
  }

  return {
    contributors,
    loading,
    gitHubPreview,
    isFetchingGitHub,
    loadContributors,
    fetchGitHub,
    saveContributor,
    deleteContributorById,
    setGitHubPreview,
  }
}
