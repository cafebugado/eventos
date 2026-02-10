import { useState, useCallback } from 'react'
import {
  getEvents,
  getEventStats,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} from '../services/eventService'

export default function useEvents(showNotification) {
  const [eventos, setEventos] = useState([])
  const [stats, setStats] = useState({ total: 0, noturno: 0, diurno: 0 })
  const [loading, setLoading] = useState(true)

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

  const saveEvent = async ({ id, data, imageFile }) => {
    let imageUrl = data.imagem || null

    if (imageFile) {
      imageUrl = await uploadEventImage(imageFile)
    }

    const payload = { ...data, imagem: imageUrl }

    if (id) {
      await updateEvent(id, payload)
    } else {
      await createEvent(payload)
    }

    await loadEvents()
  }

  const deleteEventById = async (id) => {
    await deleteEvent(id)
    await loadEvents()
  }
  return {
    eventos,
    stats,
    loading,
    loadEvents,
    saveEvent,
    deleteEventById,
  }
}
