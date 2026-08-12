'use client'

import { useEffect, useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import SearchModal from './SearchModal'
import FilterModal from './FilterModal'
import ViewToggle from './ViewToggle'

const FILTER_CONTROL_HEIGHT = 40

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
  viewMode,
  onChangeViewMode,
  tags,
  isMobile,
  locationOptions,
  selectedLocation,
  onSelectLocation,
}) {
  const [searchEditing, setSearchEditing] = useState(Boolean(searchTerm))
  const [desktopSearchValue, setDesktopSearchValue] = useState(searchTerm)
  const [mobileSearchDraft, setMobileSearchDraft] = useState(searchTerm)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const searchInputRef = useRef(null)
  const searchOpen = searchEditing
  const canSubmitDesktopSearch = desktopSearchValue.trim().length > 0

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  function applySearch(value) {
    const nextSearchTerm = String(value || '').trim()
    if (!nextSearchTerm) {
      return
    }

    setDesktopSearchValue(nextSearchTerm)
    setMobileSearchDraft(nextSearchTerm)
    onSearchChange(nextSearchTerm)
    setSearchModalOpen(false)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    applySearch(desktopSearchValue)
  }

  function handleSearchBlur(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }

    setSearchEditing(false)
    setDesktopSearchValue(searchTerm)
  }

  function handleClearSearch() {
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
    }
    setDesktopSearchValue('')
    setMobileSearchDraft('')
    onSearchChange('')
    setSearchEditing(false)
  }

  function handleSearchToggle() {
    if (isMobile) {
      setMobileSearchDraft(searchTerm)
      setSearchModalOpen(true)
      return
    }

    setDesktopSearchValue(searchTerm)
    setSearchEditing(true)
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 3 }}
    >
      {searchOpen ? (
        <Stack
          component="form"
          direction="row"
          spacing={1}
          onSubmit={handleSearchSubmit}
          onBlur={handleSearchBlur}
          sx={{ alignItems: 'center', flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
        >
          <TextField
            key={searchTerm}
            inputRef={searchInputRef}
            size="small"
            placeholder="Buscar evento..."
            value={desktopSearchValue}
            onChange={(event) => setDesktopSearchValue(event.target.value)}
            sx={{
              flex: 1,
              minWidth: { xs: 0, sm: 260 },
              '& .MuiInputBase-root': { height: FILTER_CONTROL_HEIGHT },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: desktopSearchValue ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Limpar busca" onClick={handleClearSearch}>
                      <CloseOutlinedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmitDesktopSearch}
            sx={{ height: FILTER_CONTROL_HEIGHT }}
          >
            Buscar
          </Button>
        </Stack>
      ) : (
        <IconButton
          onClick={handleSearchToggle}
          aria-label="Abrir busca"
          color={searchTerm ? 'primary' : 'default'}
          sx={{
            width: 40,
            height: 40,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <SearchOutlinedIcon fontSize="small" />
        </IconButton>
      )}

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        value={mobileSearchDraft}
        onChange={setMobileSearchDraft}
        onSubmit={applySearch}
        onClear={handleClearSearch}
      />

      <Badge badgeContent={filterActiveCount} color="primary">
        <Button
          variant="outlined"
          color={filterActiveCount > 0 ? 'primary' : 'inherit'}
          startIcon={<FilterListOutlinedIcon fontSize="small" />}
          onClick={() => setFilterModalOpen(true)}
          sx={{ height: FILTER_CONTROL_HEIGHT }}
        >
          Filtros
        </Button>
      </Badge>

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
        locationOptions={locationOptions}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
      />
    </Stack>
  )
}
