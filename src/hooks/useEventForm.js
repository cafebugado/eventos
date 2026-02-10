import { formatDateToDisplay, getDayName } from '../admin/utils/dateUtils'

export default function useEventForm() {
  function buildEventData(formData) {
    const displayDate = formatDateToDisplay(formData.data_evento) || formData.data_evento

    const resolvedDayName = getDayName(formData.data_evento) || formData.dia_semana

    const isOnline = formData.modalidade === 'Online'

    return {
      nome: formData.nome,
      descricao: formData.descricao || null,
      data_evento: displayDate,
      horario: formData.horario,
      dia_semana: resolvedDayName,
      periodo: formData.periodo,
      link: formData.link || null,

      imagem: formData.imagem || null,
      modalidade: formData.modalidade || null,

      endereco: isOnline ? null : formData.endereco || null,
      cidade: isOnline ? null : formData.cidade || null,
      estado: isOnline ? null : formData.estado || null,
    }
  }

  return { buildEventData }
}
