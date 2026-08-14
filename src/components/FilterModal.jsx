'use client'

import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Modal } from './Modal'

export default function FilterModal({
  isOpen,
  onClose,
  tags,
  onApplyFilters,
  selectedTagId,
  onSelectTag,
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  onClearFilters,
  locationOptions,
  selectedLocation,
  onSelectLocation,
}) {
  const [draftTagId, setDraftTagId] = useState(selectedTagId)
  const [draftLocation, setDraftLocation] = useState(selectedLocation)
  const [draftDate, setDraftDate] = useState(dateFrom || dateTo)
  const hasDraftSelection = Boolean(draftTagId || draftLocation || draftDate)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const timeoutId = setTimeout(() => {
      setDraftTagId(selectedTagId)
      setDraftLocation(selectedLocation)
      setDraftDate(dateFrom || dateTo)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [dateFrom, dateTo, isOpen, selectedLocation, selectedTagId])

  function applyFilters({ tag, local, from, to }) {
    if (onApplyFilters) {
      onApplyFilters({ tag, local, from, to })
      return
    }

    onSelectTag(tag)
    onSelectLocation(local)
    onDateFrom(from)
    onDateTo(to)
  }

  function handleClear() {
    setDraftTagId('')
    setDraftLocation('')
    setDraftDate('')

    if (onClearFilters) {
      onClearFilters()
      return
    }

    applyFilters({ tag: '', local: '', from: '', to: '' })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!hasDraftSelection) {
      return
    }

    applyFilters({ tag: draftTagId, local: draftLocation, from: draftDate, to: '' })
    onClose()
  }

  const footer = (
    <>
      <Button color="inherit" disabled={!hasDraftSelection} onClick={handleClear}>
        Limpar
      </Button>
      <Button variant="contained" disabled={!hasDraftSelection} type="submit" form="mobile-filters">
        Ver resultados
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros" size="sm" footer={footer}>
      <Stack id="mobile-filters" component="form" spacing={2.5} onSubmit={handleSubmit}>
        <TextField
          select
          label="Tag"
          size="small"
          value={draftTagId}
          onChange={(event) => setDraftTagId(event.target.value)}
          fullWidth
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
          value={draftLocation}
          onChange={(event) => setDraftLocation(event.target.value)}
          disabled={locationOptions.length === 0}
          fullWidth
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
          value={draftDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(event) => setDraftDate(event.target.value)}
          fullWidth
        />
      </Stack>
    </Modal>
  )
}
