'use client'

import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { Modal } from './Modal'

const FORM_ID = 'event-search-modal-form'

export default function SearchModal({ isOpen, onClose, value, onChange, onSubmit, onClear }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50)
      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [isOpen])

  function handleSubmit(event) {
    event.preventDefault()
    if (!value.trim()) {
      return
    }
    onSubmit?.(value)
  }

  function handleClear() {
    onChange('')
    onClear?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buscar evento"
      size="sm"
      footer={
        <Button type="submit" form={FORM_ID} variant="contained" disabled={!value.trim()} fullWidth>
          Buscar
        </Button>
      }
    >
      <Box component="form" id={FORM_ID} onSubmit={handleSubmit}>
        <TextField
          inputRef={inputRef}
          type="text"
          placeholder="Buscar evento..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: value ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Limpar busca" onClick={handleClear}>
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      </Box>
    </Modal>
  )
}
