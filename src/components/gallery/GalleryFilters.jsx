import { Search, X } from 'lucide-react'
import './GalleryFilters.css'

function GalleryFilters({
  searchTerm,
  onSearchChange,
  communities,
  selectedCommunity,
  onCommunityChange,
  totalPhotos,
}) {
  const hasActiveFilter = searchTerm || selectedCommunity !== 'Todas'

  const clearFilters = () => {
    onSearchChange('')
    onCommunityChange('Todas')
  }

  return (
    <div className="gf-wrapper">
      <div className="gf-search-row">
        <div className="gf-search-box">
          <Search size={16} className="gf-search-icon" />
          <input
            type="text"
            placeholder="Buscar evento ou comunidade..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="gf-search-input"
            aria-label="Buscar na galeria"
          />
          {searchTerm && (
            <button
              className="gf-clear-input"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {hasActiveFilter && (
          <button className="gf-clear-all" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}
      </div>

      <div className="gf-communities-row">
        {communities.map((community) => (
          <button
            key={community}
            className={`gf-community-chip ${selectedCommunity === community ? 'gf-chip-active' : ''}`}
            onClick={() => onCommunityChange(community)}
          >
            {community}
          </button>
        ))}
      </div>

      <p className="gf-count">
        {totalPhotos} foto{totalPhotos !== 1 ? 's' : ''} encontrada
        {totalPhotos !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default GalleryFilters
