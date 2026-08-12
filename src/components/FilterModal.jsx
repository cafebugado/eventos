'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined'
import { Modal } from './Modal'

export default function FilterModal({
  isOpen,
  onClose,
  tags,
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
  const activeCount =
    (selectedTagId ? 1 : 0) + (selectedLocation ? 1 : 0) + (dateFrom || dateTo ? 1 : 0)

  const footer = (
    <>
      {activeCount > 0 && (
        <Button
          color="inherit"
          onClick={() => {
            if (onClearFilters) {
              onClearFilters()
            } else {
              onSelectTag('')
              onSelectLocation('')
              onDateFrom('')
              onDateTo('')
            }
          }}
        >
          Limpar filtros ({activeCount})
        </Button>
      )}
      <Button variant="contained" onClick={onClose}>
        Ver resultados
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros" size="sm" footer={footer}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Tags
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip
              label="Todas"
              size="small"
              color={!selectedTagId ? 'primary' : 'default'}
              variant={!selectedTagId ? 'filled' : 'outlined'}
              onClick={() => onSelectTag('')}
            />
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.nome}
                size="small"
                color={String(tag.id) === selectedTagId ? 'primary' : 'default'}
                variant={String(tag.id) === selectedTagId ? 'filled' : 'outlined'}
                onClick={() => onSelectTag(String(tag.id) === selectedTagId ? '' : String(tag.id))}
              />
            ))}
          </Stack>
        </Box>

        {locationOptions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Local
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip
                label="Todas"
                size="small"
                color={!selectedLocation ? 'primary' : 'default'}
                variant={!selectedLocation ? 'filled' : 'outlined'}
                onClick={() => onSelectLocation('')}
              />
              {locationOptions.map((location) => (
                <Chip
                  key={location}
                  label={location}
                  size="small"
                  color={location === selectedLocation ? 'primary' : 'default'}
                  variant={location === selectedLocation ? 'filled' : 'outlined'}
                  onClick={() => onSelectLocation(location === selectedLocation ? '' : location)}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Data
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TextField
              type="date"
              label="De"
              size="small"
              value={dateFrom}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: dateTo || undefined } }}
              onChange={(e) => onDateFrom(e.target.value)}
              fullWidth
            />
            <DateRangeOutlinedIcon fontSize="small" color="disabled" />
            <TextField
              type="date"
              label="Até"
              size="small"
              value={dateTo}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: dateFrom || undefined },
              }}
              onChange={(e) => onDateTo(e.target.value)}
              fullWidth
            />
          </Stack>
        </Box>
      </Stack>
    </Modal>
  )
}
