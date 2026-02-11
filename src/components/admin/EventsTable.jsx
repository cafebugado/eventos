import React from 'react'
import { parseDateValue } from '../../admin/utils/dateUtils'
import { stripRichText } from '../../utils/richText'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import BgEventos from '../../assets/eventos.png'

const EventsTable = ({ pagedItems, openEditModal, handleDeleteEvent }) => {
  return (
    <div className="events-table-container">
      <table className="events-table">
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome do Evento</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Período</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pagedItems.map((evento) => {
            const eventDate = parseDateValue(evento.data_evento)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isPast = eventDate && eventDate < today

            return (
              <tr key={evento.id} className={isPast ? 'event-row-past' : ''}>
                <td data-label="Imagem">
                  <img
                    src={evento.imagem || BgEventos}
                    alt={evento.nome}
                    className="event-thumbnail"
                  />
                </td>
                <td data-label="Nome do Evento">
                  <span className="event-name">{evento.nome}</span>
                  {evento.descricao && (
                    <span className="event-desc-preview">{stripRichText(evento.descricao)}</span>
                  )}
                  {isPast && <span className="badge badge-encerrado">Encerrado</span>}
                </td>
                <td data-label="Data">{evento.data_evento}</td>
                <td data-label="Horário">{evento.horario}</td>
                <td data-label="Período">
                  <span className={`badge badge-${evento.periodo?.toLowerCase()}`}>
                    {evento.periodo}
                  </span>
                </td>
                <td data-label="Ações">
                  <div className="action-buttons">
                    {!isPast && (
                      <>
                        <button
                          className="btn-icon btn-view"
                          onClick={() => window.open(evento.link, '_blank')}
                          title="Ver evento"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => openEditModal(evento)}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                      </>
                    )}
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteEvent(evento.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default EventsTable
