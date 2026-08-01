'use client'

import { memo } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

export const FavouriteEventButton = memo(function FavouriteEventButton({
  event,
  isFavourite,
  onToggle,
  isCard,
}) {
  const handleClick = (e) => {
    e.stopPropagation()
    onToggle(event.id)
  }

  const icon = isFavourite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />
  const label = isFavourite ? 'Remover dos favoritos' : 'Favoritar'

  if (!isCard) {
    return (
      <Button variant="outlined" color="inherit" onClick={handleClick} endIcon={icon}>
        {label}
      </Button>
    )
  }

  return (
    <IconButton onClick={handleClick} aria-label={label}>
      {icon}
    </IconButton>
  )
})
