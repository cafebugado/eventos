import { useState } from 'react'
import { getEventTags } from '../services/tagService'

export default function useEventTags() {
  const [selectedTags, setSelectedTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)

  async function loadTagsByEvent(eventId) {
    if (!eventId) {
      return
    }

    setLoadingTags(true)
    try {
      const tags = await getEventTags(eventId)
      setSelectedTags(tags.map((tag) => tag.id))
    } catch (error) {
      console.error('Erro ao carregar tags do evento:', error)
      setSelectedTags([])
    } finally {
      setLoadingTags(false)
    }
  }

  function resetTags() {
    setSelectedTags([])
  }

  return {
    selectedTags,
    setSelectedTags,
    loadingTags,
    loadTagsByEvent,
    resetTags,
  }
}
