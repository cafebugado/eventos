import React from 'react'
import { Plus, Search, Calendar } from 'lucide-react'
import EventsTable from './EventsTable'
import Pagination from '../Pagination'

const EventsSection = ({
  openCreateModal,
  isShowingSearch,
  searchTerm,
  isLoading,
  filteredEvents,
  handleDeleteEvent,
  openEditModal,
  pagedItems,
  currentPage,
  totalPages,
  goToPage,
  eventos,
  setSearchTerm,
}) => {
  return (
    <div className="events-section">
      <div className="section-header">
        <h2>Eventos Cadastrados</h2>
        <button className="btn-primary" onClick={openCreateModal} aria-label="Novo Evento">
          <Plus size={18} />
          <span className="btn-text">Novo Evento</span>
        </button>
      </div>

      {isShowingSearch && (
        <div className="events-toolbar">
          <div className="events-search">
            <Search size={18} className="events-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, descricao ou data..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Buscar eventos"
            />
            {searchTerm && (
              <button
                type="button"
                className="events-search-clear"
                onClick={() => setSearchTerm('')}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>Nenhum evento cadastrado</h3>
          <p>Clique em "Novo Evento" para criar seu primeiro evento.</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h3>Nenhum evento encontrado</h3>
          <p>Tente ajustar sua busca para encontrar o evento desejado.</p>
        </div>
      ) : (
        <>
          <EventsTable
            handleDeleteEvent={handleDeleteEvent}
            openEditModal={openEditModal}
            pagedItems={pagedItems}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  )
}

export default EventsSection
