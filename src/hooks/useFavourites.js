import { useState, useMemo, useCallback } from 'react'

export default function useFavourites(agenda) {
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem('favourites')
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const favouriteIds = useMemo(() => new Set(favourites.map((fav) => fav?.id)), [favourites])

  const toggleFavourite = useCallback(
    (eventId) => {
      setFavourites((prev) => {
        const index = prev.findIndex((fav) => fav?.id === eventId)
        let next

        if (index === -1) {
          const event = agenda.find((e) => e.id === eventId)
          if (!event) {
            return prev
          }
          next = [...prev, event]
        } else {
          next = prev.filter((fav) => fav?.id !== eventId)
        }

        try {
          localStorage.setItem('favourites', JSON.stringify(next))
        } catch {
          // ignore
        }

        return next
      })
    },
    [agenda]
  )

  return { favouriteIds, toggleFavourite }
}
