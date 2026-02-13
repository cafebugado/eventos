import { Heart } from 'lucide-react'
import { memo } from 'react'

export const FavouriteEventButton = memo(
  ({
    event,
    isFavourite,
    onToggle,
  }: {
    event: any
    isFavourite: boolean
    onToggle: (id: string) => void
  }) => {
    return (
      <div
        style={{ position: 'absolute', left: '15px', top: '10px', zIndex: 20, cursor: 'pointer' }}
        className="card-heart"
        onClick={(e) => {
          e.stopPropagation() // Prevent card click if the card itself is clickable
          onToggle(event.id)
        }}
      >
        <Heart fill={isFavourite ? 'red' : 'transparent'} color="red" size={24} />
      </div>
    )
  }
)

FavouriteEventButton.displayName = 'FavouriteEventButton'
