import { Heart } from 'lucide-react'
import { memo } from 'react'

export const FavouriteEventButton = memo(({ event, isFavourite, onToggle, isCard }) => {
  if (!isCard) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(event.id)
        }}
        className="favourite-button"
      >
        {isFavourite ? 'Remover dos favoritos' : 'Favoritar'}
        <Heart
          fill={isFavourite ? 'red' : 'transparent'}
          style={{ color: isFavourite ? 'transparent' : 'red' }}
        />
      </button>
    )
  } else {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(event.id)
        }}
        className="card-heart-div"
      >
        <Heart size={24} className={`heart-icon ${isFavourite ? 'is-active' : ''}`} />
      </button>
    )
  }
})

FavouriteEventButton.displayName = 'FavouriteEventButton'
