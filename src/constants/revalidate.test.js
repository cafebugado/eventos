import { describe, expect, it } from 'vitest'
import { DATA_REVALIDATE, PAGE_REVALIDATE } from './revalidate'

// Quais fetches cada página dispara durante a renderização no servidor.
const PAGE_DATA = {
  HOME: ['FEATURED_EVENTS', 'EVENTS_TAGS_MAP'],
  EVENTS: ['PUBLISHED_EVENTS', 'TAGS', 'EVENTS_TAGS_MAP'],
  EVENT_DETAIL: ['EVENT_DETAIL'],
  FAVOURITES: ['EVENTS_TAGS_MAP'],
  GALLERY: ['GALLERY_ALBUMS'],
  ABOUT: ['CONTRIBUTORS', 'EVENT_STATS'],
}

describe('janelas de revalidação', () => {
  it('cobre todas as páginas com ISR', () => {
    expect(Object.keys(PAGE_DATA).sort()).toEqual(Object.keys(PAGE_REVALIDATE).sort())
  })

  it.each(Object.entries(PAGE_DATA))(
    'nenhum fetch de %s tem janela menor que a da página',
    (page, dataKeys) => {
      for (const dataKey of dataKeys) {
        expect(DATA_REVALIDATE[dataKey]).toBeGreaterThanOrEqual(PAGE_REVALIDATE[page])
      }
    }
  )

  it('todas as janelas são inteiros positivos em segundos', () => {
    for (const seconds of [...Object.values(PAGE_REVALIDATE), ...Object.values(DATA_REVALIDATE)]) {
      expect(Number.isInteger(seconds)).toBe(true)
      expect(seconds).toBeGreaterThan(0)
    }
  })
})
