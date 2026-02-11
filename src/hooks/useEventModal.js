import { useState } from 'react'
import { formatDateToInput, getDayName } from '../admin/utils/dateUtils'

export default function useEventModal({
  resetForm,
  setValue,
  resetTags,
  loadTagsByEvent,
  setImageFile,
  setImagePreview,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  function openCreateModal() {
    resetForm()
    resetTags()
    setImageFile(null)
    setImagePreview(null)
    setEditingEvent(null)
    setIsOpen(true)
  }

  async function openEditModal(evento) {
    const normalizedDate = formatDateToInput(evento.data_evento)
    const dayName = getDayName(normalizedDate || evento.data_evento) || evento.dia_semana || ''

    setEditingEvent(evento)
    setImageFile(null)
    setImagePreview(evento.imagem || null)

    setValue('nome', evento.nome)
    setValue('descricao', evento.descricao || '')
    setValue('data_evento', normalizedDate)
    setValue('horario', evento.horario)
    setValue('dia_semana', dayName)
    setValue('periodo', evento.periodo)
    setValue('link', evento.link)
    setValue('imagem', evento.imagem || '')
    setValue('modalidade', evento.modalidade || '')
    setValue('endereco', evento.endereco || '')
    setValue('cidade', evento.cidade || '')
    setValue('estado', evento.estado || '')

    await loadTagsByEvent(evento.id)
    setIsOpen(true)
  }

  function closeModal() {
    resetForm()
    resetTags()
    setEditingEvent(null)
    setImageFile(null)
    setImagePreview(null)
    setIsOpen(false)
  }

  return {
    isOpen,
    editingEvent,
    openCreateModal,
    openEditModal,
    closeModal,
  }
}
