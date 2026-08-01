import { useState } from 'react'
import { FavouriteEventButton } from './FavouriteEventButton'

export default {
  title: 'Design System/FavouriteEventButton',
  component: FavouriteEventButton,
}

const event = { id: '1', nome: 'Evento Exemplo' }

function Template({ isCard }) {
  const [isFavourite, setIsFavourite] = useState(false)
  return (
    <FavouriteEventButton
      event={event}
      isFavourite={isFavourite}
      onToggle={() => setIsFavourite((prev) => !prev)}
      isCard={isCard}
    />
  )
}

export const Botao = {
  render: () => <Template isCard={false} />,
}

export const Icone = {
  render: () => <Template isCard />,
}
