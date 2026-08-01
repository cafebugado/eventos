'use client'

import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function BackButton({ onClick, label = 'Voltar' }) {
  return (
    <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} onClick={onClick}>
      {label}
    </Button>
  )
}
