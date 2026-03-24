import { Eye, EyeOff, CalendarRange } from 'lucide-react'
import Modal from './Modal/Modal'
import './FilterModal.css'

export default function FilterModal({
  isOpen,
  onClose,
  tags,
  selectedTagId,
  onSelectTag,
  showPastEvents,
  onTogglePast,
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
}) {
  const activeCount =
    (selectedTagId ? 1 : 0) + (showPastEvents ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)

  const footer = (
    <>
      {activeCount > 0 && (
        <button
          className="fm-clear"
          onClick={() => {
            onSelectTag('')
            if (showPastEvents) {
              onTogglePast()
            }
            onDateFrom('')
            onDateTo('')
          }}
        >
          Limpar filtros ({activeCount})
        </button>
      )}
      <button className="fm-apply" onClick={onClose}>
        Ver resultados
      </button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros" size="sm" footer={footer}>
      {/* Tags */}
      <section className="fm-section">
        <h3 className="fm-section-title">Tags</h3>
        <div className="fm-tags">
          <button
            className={`fm-tag${!selectedTagId ? ' fm-tag--active' : ''}`}
            onClick={() => onSelectTag('')}
          >
            Todas
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={`fm-tag${String(tag.id) === selectedTagId ? ' fm-tag--active' : ''}`}
              style={{ '--tag-color': tag.cor || 'var(--primary-blue)' }}
              onClick={() => onSelectTag(String(tag.id) === selectedTagId ? '' : String(tag.id))}
            >
              {tag.nome}
            </button>
          ))}
        </div>
      </section>

      {/* Data */}
      <section className="fm-section">
        <h3 className="fm-section-title">Data</h3>
        <div className="fm-date-row">
          <div className="fm-date-field">
            <label className="fm-date-label">De</label>
            <input
              type="date"
              className="fm-date-input"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => onDateFrom(e.target.value)}
            />
          </div>
          <div className="fm-date-sep">
            <CalendarRange size={16} />
          </div>
          <div className="fm-date-field">
            <label className="fm-date-label">Até</label>
            <input
              type="date"
              className="fm-date-input"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => onDateTo(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Eventos passados */}
      <section className="fm-section">
        <h3 className="fm-section-title">Período</h3>
        <button
          className={`fm-option${showPastEvents ? ' fm-option--active' : ''}`}
          onClick={onTogglePast}
        >
          <span className="fm-option-icon">
            {showPastEvents ? <Eye size={18} /> : <EyeOff size={18} />}
          </span>
          <span className="fm-option-label">
            <strong>{showPastEvents ? 'Mostrando' : 'Ocultar'} eventos passados</strong>
            <small>
              {showPastEvents
                ? 'Clique para ocultar eventos já realizados'
                : 'Clique para incluir eventos já realizados'}
            </small>
          </span>
        </button>
      </section>
    </Modal>
  )
}
