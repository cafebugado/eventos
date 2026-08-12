'use client'

import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import SearchModal from './SearchModal'
import FilterModal from './FilterModal'
import ViewToggle from './ViewToggle'

const FILTER_CONTROL_HEIGHT = 40
const SELECT_MENU_PROPS = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  slotProps: {
    paper: {
      sx: {
        mt: 0.5,
        maxHeight: 280,
        overflowY: 'auto',
      },
    },
    list: {
      sx: { py: 0.5 },
    },
  },
}

function getSingleDateFilterValue(dateFrom, dateTo) {
  return dateFrom && (!dateTo || dateTo === dateFrom) ? dateFrom : ''
}

export default function EventsFilters({
  searchTerm,
  onSearchChange,
  selectedTagId,
  onSelectTag,
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  onApplyFilters,
  onClearFilters,
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
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false)
  const [desktopTagDraft, setDesktopTagDraft] = useState(selectedTagId)
  const [desktopLocationDraft, setDesktopLocationDraft] = useState(selectedLocation)
  const [desktopDateDraft, setDesktopDateDraft] = useState(
    getSingleDateFilterValue(dateFrom, dateTo)
  )
  const [desktopTagMenuOpen, setDesktopTagMenuOpen] = useState(false)
  const [desktopLocationMenuOpen, setDesktopLocationMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const filtersRootRef = useRef(null)
  const searchInputRef = useRef(null)
  const filtersVisible = viewMode !== 'calendar'
  const searchOpen = searchEditing
  const canSubmitDesktopSearch = desktopSearchValue.trim().length > 0
  const desktopSelectMenuOpen = desktopTagMenuOpen || desktopLocationMenuOpen
  const currentSingleDateFilter = getSingleDateFilterValue(dateFrom, dateTo)
  const desktopDraftHasSelection = Boolean(
    desktopTagDraft || desktopLocationDraft || desktopDateDraft
  )
  const canClearDesktopFilters = desktopDraftHasSelection || filterActiveCount > 0

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    if (!desktopFiltersOpen) {
      return undefined
    }

    function handleOutsideClick(event) {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      if (target.closest('[role="listbox"], [role="option"], .MuiPopover-root')) {
        return
      }

      if (!filtersRootRef.current?.contains(target)) {
        setDesktopTagMenuOpen(false)
        setDesktopLocationMenuOpen(false)
        setDesktopFiltersOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [desktopFiltersOpen])

  useEffect(() => {
    if (!desktopSelectMenuOpen) {
      return undefined
    }

    function handlePageScroll(event) {
      const target = event.target
      if (target instanceof Element && target.closest('[role="listbox"], .MuiPopover-root')) {
        return
      }

      setDesktopTagMenuOpen(false)
      setDesktopLocationMenuOpen(false)
    }

    window.addEventListener('scroll', handlePageScroll, true)
    return () => window.removeEventListener('scroll', handlePageScroll, true)
  }, [desktopSelectMenuOpen])

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

  function openDesktopFilters() {
    setDesktopTagMenuOpen(false)
    setDesktopLocationMenuOpen(false)

    if (desktopFiltersOpen) {
      setDesktopFiltersOpen(false)
      return
    }

    setDesktopTagDraft(selectedTagId)
    setDesktopLocationDraft(selectedLocation)
    setDesktopDateDraft(currentSingleDateFilter)
    setDesktopFiltersOpen(true)
  }

  function handleFilterClick() {
    if (isMobile) {
      setFilterModalOpen(true)
      return
    }

    openDesktopFilters()
  }

  function handleDesktopFiltersSubmit(event) {
    event.preventDefault()

    if (!desktopDraftHasSelection) {
      return
    }

    setDesktopTagMenuOpen(false)
    setDesktopLocationMenuOpen(false)

    if (onApplyFilters) {
      onApplyFilters({
        tag: desktopTagDraft,
        local: desktopLocationDraft,
        from: desktopDateDraft,
        to: '',
      })
    } else {
      onSelectTag(desktopTagDraft)
      onSelectLocation(desktopLocationDraft)
      onDateFrom(desktopDateDraft)
      onDateTo('')
    }
  }

  function handleDesktopFiltersClear() {
    setDesktopTagMenuOpen(false)
    setDesktopLocationMenuOpen(false)
    setDesktopTagDraft('')
    setDesktopLocationDraft('')
    setDesktopDateDraft('')

    if (onClearFilters) {
      onClearFilters()
    } else {
      onSelectTag('')
      onSelectLocation('')
      onDateFrom('')
      onDateTo('')
    }

    setDesktopFiltersOpen(false)
  }

  function handleViewModeChange(nextViewMode) {
    if (nextViewMode === 'calendar') {
      setSearchEditing(false)
      setSearchModalOpen(false)
      setFilterModalOpen(false)
      setDesktopTagMenuOpen(false)
      setDesktopLocationMenuOpen(false)
      setDesktopFiltersOpen(false)
    }

    onChangeViewMode(nextViewMode)
  }

  return (
    <Stack ref={filtersRootRef} spacing={1.5} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        {filtersVisible &&
          (searchOpen ? (
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
                        <IconButton
                          size="small"
                          aria-label="Limpar busca"
                          onClick={handleClearSearch}
                        >
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
          ))}

        <SearchModal
          isOpen={filtersVisible && searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          value={mobileSearchDraft}
          onChange={setMobileSearchDraft}
          onSubmit={applySearch}
          onClear={handleClearSearch}
        />

        {filtersVisible && (
          <Badge badgeContent={filterActiveCount} color="primary">
            <Button
              variant="outlined"
              color={filterActiveCount > 0 ? 'primary' : 'inherit'}
              startIcon={<FilterListOutlinedIcon fontSize="small" />}
              onClick={handleFilterClick}
              aria-expanded={!isMobile ? desktopFiltersOpen : undefined}
              sx={{ height: FILTER_CONTROL_HEIGHT }}
            >
              Filtros
            </Button>
          </Badge>
        )}

        <Stack sx={{ ml: 'auto' }}>
          <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
        </Stack>
      </Stack>

      {filtersVisible && !isMobile && desktopFiltersOpen && (
        <Box
          component="form"
          onSubmit={handleDesktopFiltersSubmit}
          sx={{
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            p: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <TextField
              select
              label="Tags"
              size="small"
              value={desktopTagDraft}
              onChange={(event) => setDesktopTagDraft(event.target.value)}
              slotProps={{
                select: {
                  MenuProps: SELECT_MENU_PROPS,
                  open: desktopTagMenuOpen,
                  onOpen: () => {
                    setDesktopLocationMenuOpen(false)
                    setDesktopTagMenuOpen(true)
                  },
                  onClose: () => setDesktopTagMenuOpen(false),
                },
              }}
              sx={{
                minWidth: { md: 180 },
                '& .MuiInputBase-root': { height: FILTER_CONTROL_HEIGHT },
              }}
            >
              <MenuItem value="">Todas as tags</MenuItem>
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={String(tag.id)}>
                  {tag.nome}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Local"
              size="small"
              value={desktopLocationDraft}
              onChange={(event) => setDesktopLocationDraft(event.target.value)}
              disabled={locationOptions.length === 0}
              slotProps={{
                select: {
                  MenuProps: SELECT_MENU_PROPS,
                  open: desktopLocationMenuOpen,
                  onOpen: () => {
                    setDesktopTagMenuOpen(false)
                    setDesktopLocationMenuOpen(true)
                  },
                  onClose: () => setDesktopLocationMenuOpen(false),
                },
              }}
              sx={{
                minWidth: { md: 200 },
                '& .MuiInputBase-root': { height: FILTER_CONTROL_HEIGHT },
              }}
            >
              <MenuItem value="">Todos os locais</MenuItem>
              {locationOptions.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Data"
              size="small"
              value={desktopDateDraft}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) => setDesktopDateDraft(event.target.value)}
              sx={{
                minWidth: { md: 170 },
                '& .MuiInputBase-root': { height: FILTER_CONTROL_HEIGHT },
              }}
            />

            <Button
              type="button"
              variant="outlined"
              color="inherit"
              disabled={!canClearDesktopFilters}
              onClick={handleDesktopFiltersClear}
              sx={{ height: FILTER_CONTROL_HEIGHT, ml: { md: 'auto' } }}
            >
              Limpar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={!desktopDraftHasSelection}
              sx={{ height: FILTER_CONTROL_HEIGHT }}
            >
              Ver resultados
            </Button>
          </Stack>
        </Box>
      )}

      <FilterModal
        isOpen={filtersVisible && isMobile && filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        tags={tags}
        selectedTagId={selectedTagId}
        onSelectTag={onSelectTag}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={onDateFrom}
        onDateTo={onDateTo}
        onClearFilters={onClearFilters}
        locationOptions={locationOptions}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
      />
    </Stack>
  )
}
