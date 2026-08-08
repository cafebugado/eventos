import { describe, expect, it } from 'vitest'
import EventDetailsPage, { generateMetadata } from './page'

describe('EventDetailsPage', () => {
  it('propaga erro para o error boundary da rota (sem fonte de dados até a nova API ser plugada)', async () => {
    await expect(
      EventDetailsPage({ params: Promise.resolve({ slug: 'evento-teste' }) })
    ).rejects.toThrow()
  })

  describe('generateMetadata', () => {
    it('propaga erro (sem fonte de dados até a nova API ser plugada)', async () => {
      await expect(
        generateMetadata({ params: Promise.resolve({ slug: 'evento-teste' }) })
      ).rejects.toThrow()
    })
  })
})
