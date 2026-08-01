import { beforeEach, describe, expect, it } from 'vitest'
import { useFavouritesStore } from './useFavouritesStore'

const events = [
  { id: '1', nome: 'Evento 1' },
  { id: '2', nome: 'Evento 2' },
]

function resetStore() {
  useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
  window.localStorage.clear()
}

describe('useFavouritesStore', () => {
  beforeEach(resetStore)

  it('adiciona um evento aos favoritos', () => {
    useFavouritesStore.getState().toggleFavourite('1', events)

    const { favourites, favouriteIds } = useFavouritesStore.getState()
    expect(favourites).toEqual([events[0]])
    expect(favouriteIds.has('1')).toBe(true)
  })

  it('remove um evento já favoritado', () => {
    useFavouritesStore.getState().toggleFavourite('1', events)
    useFavouritesStore.getState().toggleFavourite('1', events)

    const { favourites, favouriteIds } = useFavouritesStore.getState()
    expect(favourites).toEqual([])
    expect(favouriteIds.has('1')).toBe(false)
  })

  it('ignora toggle para um evento inexistente na lista', () => {
    useFavouritesStore.getState().toggleFavourite('999', events)

    expect(useFavouritesStore.getState().favourites).toEqual([])
  })

  it('migra o formato legado (array direto) salvo pelo app antigo', () => {
    window.localStorage.setItem('favourites', JSON.stringify([events[1]]))

    const persisted = useFavouritesStore.persist.getOptions().storage.getItem('favourites')

    expect(persisted).toEqual({ state: { favourites: [events[1]] }, version: 0 })
  })
})
