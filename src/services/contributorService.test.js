import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { getContributors } from './contributorService'

const API_BASE_URL = 'https://v2.backendeventoscfb.cafebugado.com.br'

describe('getContributors', () => {
  it('busca contribuintes na API', async () => {
    const contributors = [
      { id: '1', nome: 'Ana' },
      { id: '2', nome: 'Bruno' },
    ]
    server.use(http.get(`${API_BASE_URL}/contributors`, () => HttpResponse.json(contributors)))

    const result = await getContributors()

    expect(result).toEqual(contributors)
  })

  it('propaga erro quando a API responde com falha', async () => {
    server.use(
      http.get(`${API_BASE_URL}/contributors`, () => HttpResponse.json(null, { status: 500 }))
    )

    await expect(getContributors()).rejects.toThrow()
  })
})
