import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

function computeFavouriteIds(favourites) {
  return new Set(favourites.map((fav) => fav?.id))
}

// Storage compatível com o formato legado do app antigo (localStorage
// 'favourites' guardando um array de eventos direto, sem envelope) — migra
// silenciosamente para o formato do zustand/persist na primeira leitura, para
// que os favoritos dos usuários sobrevivam ao cutover da Fase 5.
const legacyAwareStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') {
      return null
    }
    const raw = window.localStorage.getItem(name)
    if (!raw) {
      return null
    }
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        return raw
      }
      if (Array.isArray(parsed)) {
        return JSON.stringify({ state: { favourites: parsed }, version: 0 })
      }
      return null
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(name)
  },
}

export const useFavouritesStore = create(
  persist(
    (set, get) => ({
      favourites: [],
      favouriteIds: new Set(),

      // allEvents: lista completa de eventos, necessária para resolver o
      // objeto completo do evento ao favoritar (mesma limitação do
      // useFavourites.js original).
      toggleFavourite: (eventId, allEvents) => {
        const { favourites } = get()
        const index = favourites.findIndex((fav) => fav?.id === eventId)
        let next

        if (index === -1) {
          const event = (allEvents || []).find((e) => e.id === eventId)
          if (!event) {
            return
          }
          next = [...favourites, event]
        } else {
          next = favourites.filter((fav) => fav?.id !== eventId)
        }

        set({ favourites: next, favouriteIds: computeFavouriteIds(next) })
      },
    }),
    {
      name: 'favourites',
      storage: createJSONStorage(() => legacyAwareStorage),
      partialize: (state) => ({ favourites: state.favourites }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.favouriteIds = computeFavouriteIds(state.favourites)
        }
      },
    }
  )
)
