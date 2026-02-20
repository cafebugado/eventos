import { Heart } from 'lucide-react'
import { memo } from 'react'

export const FavouriteEventButton = memo(({ event, isFavourite, onToggle, isCard }) => {
  if (!isCard) {
    return (
      // <div
      //   className="card-heart-div"

      // >
      //   <p>Favoritar</p>
      //   <Heart fill={isFavourite ? 'red' : 'transparent'} color="red" size={24} />
      // </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(event.id)
        }}
        className="participate-button"
        style={{
          backgroundColor: 'transparent',
          outline: '1px solid white',
          fontSize: '16px',
          zIndex: 30,
        }}
      >
        {isFavourite ? 'Remover dos favoritos' : 'Favoritar'}
        <Heart
          fill={isFavourite ? 'red' : 'transparent'}
          style={{ color: isFavourite ? 'transparent' : 'white' }}
        />
      </button>
    )
  } else {
    return (
      // <div
      //   className="card-heart-div"

      // >
      //   <p>Favoritar</p>
      //   <Heart fill={isFavourite ? 'red' : 'transparent'} color="red" size={24} />
      // </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(event.id)
        }}
        className="card-heart-div"
      >
        <Heart
          fill={isFavourite ? 'red' : 'transparent'}
          style={{ color: isFavourite ? 'transparent' : 'white' }}
        />
      </button>
    )
  }
})

FavouriteEventButton.displayName = 'FavouriteEventButton'
