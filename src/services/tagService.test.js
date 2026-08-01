import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { getAllEventTags, getEventTags, getTags } from './tagService'

const API_BASE_URL = 'https://v2.backendeventoscfb.cafebugado.com.br'

describe('getTags', () => {
  it('busca todas as tags', async () => {
    const tags = [{ id: '1', nome: 'Python', cor: '#2563eb' }]
    server.use(http.get(`${API_BASE_URL}/tags`, () => HttpResponse.json(tags)))

    await expect(getTags()).resolves.toEqual(tags)
  })
})

describe('getAllEventTags', () => {
  it('busca o mapa de tags por evento', async () => {
    const map = { 'evento-1': [{ id: '1', nome: 'Python', cor: '#2563eb' }] }
    server.use(http.get(`${API_BASE_URL}/events/tags-map`, () => HttpResponse.json(map)))

    await expect(getAllEventTags()).resolves.toEqual(map)
  })
})

describe('getEventTags', () => {
  it('busca as tags de um evento específico', async () => {
    const tags = [{ id: '1', nome: 'Python', cor: '#2563eb' }]
    server.use(http.get(`${API_BASE_URL}/events/evento-1/tags`, () => HttpResponse.json(tags)))

    await expect(getEventTags('evento-1')).resolves.toEqual(tags)
  })
})
