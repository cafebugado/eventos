'use client'

import { useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { Modal } from './Modal'

export default function SearchModal({ isOpen, onClose, value, onChange }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50)
      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar evento" size="sm" footer={null}>
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
                <IconButton size="small" aria-label="Limpar busca" onClick={() => onChange('')}>
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
    </Modal>
  )
}
