import { useRef, useState } from 'react'
import { Search, Filter, Heart } from 'lucide-react'
import SearchModal from './SearchModal'
import FilterModal from './FilterModal'
import ViewToggle from './ViewToggle'

export default function EventsFilters({
  searchTerm,
  onSearchChange,
  selectedTagId,
  onSelectTag,
  showPastEvents,
  onTogglePast,
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  filterActiveCount,
  showOnlyFavourites,
  onToggleFavourites,
  viewMode,
  onChangeViewMode,
  tags,
  isMobile,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const searchInputRef = useRef(null)

  function handleSearchToggle() {
    if (isMobile) {
      setSearchModalOpen(true)
      return
    }
    setSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 50)
      } else {
        onSearchChange('')
      }
      return !prev
    })
  }

  return (
    <div className="eventos-filters">
      <div className={`filter-search${searchOpen ? ' filter-search--open' : ''}`}>
        <button
          className={`search-toggle${searchTerm ? ' search-toggle--active' : ''}`}
          onClick={handleSearchToggle}
          aria-label="Abrir busca"
        >
          <Search size={18} />
        </button>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar evento..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onBlur={() => {
            if (!searchTerm) {
              setSearchOpen(false)
            }
          }}
          className="search-input"
          tabIndex={searchOpen ? 0 : -1}
        />
      </div>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        value={searchTerm}
        onChange={onSearchChange}
      />

      <button
        className={`filter-toggle${filterActiveCount > 0 ? ' active' : ''}`}
        onClick={() => setFilterModalOpen(true)}
        title="Filtros"
      >
        {filterActiveCount > 0 ? (
          <span className="filter-badge">{filterActiveCount}</span>
        ) : (
          <Filter size={18} />
        )}
        <span>Filtros</span>
      </button>

      <button
        className={`filter-toggle ${showOnlyFavourites ? 'active' : ''}`}
        onClick={onToggleFavourites}
        title="Favoritos"
      >
        <Heart size={18} fill={showOnlyFavourites ? 'currentColor' : 'none'} />
        <span>Favoritos</span>
      </button>

      <ViewToggle
        viewMode={isMobile && viewMode === 'grid' ? 'list' : viewMode}
        onChange={onChangeViewMode}
        isMobile={isMobile}
      />

      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        tags={tags}
        selectedTagId={selectedTagId}
        onSelectTag={onSelectTag}
        showPastEvents={showPastEvents}
        onTogglePast={onTogglePast}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={onDateFrom}
        onDateTo={onDateTo}
      />
    </div>
  )
}
