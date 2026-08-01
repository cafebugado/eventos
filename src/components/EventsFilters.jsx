'use client'

import { useEffect, useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Fab from '@mui/material/Fab'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
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
  favouriteIds,
  viewMode,
  onChangeViewMode,
  tags,
  isMobile,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  function handleSearchToggle() {
    if (isMobile) {
      setSearchModalOpen(true)
      return
    }
    setSearchOpen((prev) => {
      if (prev) {
        onSearchChange('')
      }
      return !prev
    })
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 3 }}
    >
      {searchOpen ? (
        <TextField
          inputRef={searchInputRef}
          size="small"
          placeholder="Buscar evento..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onBlur={() => {
            if (!searchTerm) {
              setSearchOpen(false)
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      ) : (
        <IconButton
          onClick={handleSearchToggle}
          aria-label="Abrir busca"
          color={searchTerm ? 'primary' : 'default'}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <SearchOutlinedIcon fontSize="small" />
        </IconButton>
      )}

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        value={searchTerm}
        onChange={onSearchChange}
      />

      <Badge badgeContent={filterActiveCount} color="primary">
        <Button
          variant="outlined"
          color={filterActiveCount > 0 ? 'primary' : 'inherit'}
          startIcon={<FilterListOutlinedIcon fontSize="small" />}
          onClick={() => setFilterModalOpen(true)}
        >
          Filtros
        </Button>
      </Badge>

      {/* Desktop: botão favoritos ao lado dos demais filtros — só aparece se houver favoritos */}
      {!isMobile && favouriteIds?.size > 0 && (
        <Button
          variant="outlined"
          color={showOnlyFavourites ? 'primary' : 'inherit'}
          startIcon={
            showOnlyFavourites ? (
              <FavoriteIcon fontSize="small" color="error" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )
          }
          onClick={onToggleFavourites}
        >
          Favoritos
        </Button>
      )}

      {/* Mobile: FAB flutuante — só aparece se houver favoritos */}
      {isMobile && favouriteIds?.size > 0 && (
        <Fab
          size="medium"
          color={showOnlyFavourites ? 'primary' : 'default'}
          aria-label="Favoritos"
          onClick={onToggleFavourites}
          sx={{
            position: 'fixed',
            left: 16,
            bottom: 16,
            zIndex: (theme) => theme.zIndex.speedDial,
          }}
        >
          {showOnlyFavourites ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </Fab>
      )}

      <Stack sx={{ ml: 'auto' }}>
        <ViewToggle
          viewMode={isMobile && viewMode === 'grid' ? 'list' : viewMode}
          onChange={onChangeViewMode}
          isMobile={isMobile}
        />
      </Stack>

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
    </Stack>
  )
}
