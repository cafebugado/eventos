import { useState, useCallback } from 'react'
import {
  getEvents,
  getEventStats,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} from '../services/eventService'
import { setEventTags } from '../services/tagService'

export default function useEvents(showNotification) {
  const [eventos, setEventos] = useState([])
  const [stats, setStats] = useState({ total: 0, noturno: 0, diurno: 0 })
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      const [eventsData, statsData] = await Promise.all([getEvents(), getEventStats()])
      setEventos(eventsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      showNotification('Erro ao carregar eventos', 'error')
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const saveEvent = async ({ id, data, imageFile, selectedTags }) => {
    let imageUrl = data.imagem || null

    if (imageFile) {
      setIsUploading(true)
      try {
        imageUrl = await uploadEventImage(imageFile)
      } catch (uploadError) {
        console.error('Erro no upload:', uploadError)
        console.error('Erro ao enviar imagem:', uploadError.message)
        throw new Error('UPLOAD_ERROR Erro ao enviar imagem:' + uploadError.message)
      } finally {
        setIsUploading(false)
      }
    }

    const payload = { ...data, imagem: imageUrl }

    let savedEvent
    if (id) {
      savedEvent = await updateEvent(id, payload)
    } else {
      savedEvent = await createEvent(payload)
    }

    if (selectedTags?.length > 0) {
      await setEventTags(savedEvent.id, selectedTags)
    }

    await loadEvents()
    return savedEvent
  }

  const deleteEventById = async (id) => {
    await deleteEvent(id)
    await loadEvents()
  }

  return {
    eventos,
    stats,
    loading,
    isUploading,
    loadEvents,
    saveEvent,
    deleteEventById,
  }
}
