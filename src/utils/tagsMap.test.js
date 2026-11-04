import { describe, expect, it } from 'vitest'
import { filterTagsMapByEvents } from './tagsMap'

describe('filterTagsMapByEvents', () => {
  it('retorna apenas as tags dos eventos presentes na lista', () => {
    const tagsMap = {
      1: [{ id: 't1', nome: 'Backend', cor: '#2563eb' }],
      2: [{ id: 't2', nome: 'Frontend', cor: '#16a34a' }],
      3: [{ id: 't3', nome: 'DevOps', cor: '#9333ea' }],
    }
    const events = [{ id: '1' }, { id: '3' }]

    expect(filterTagsMapByEvents(tagsMap, events)).toEqual({
      1: [{ id: 't1', nome: 'Backend', cor: '#2563eb' }],
      3: [{ id: 't3', nome: 'DevOps', cor: '#9333ea' }],
    })
  })

  it('ignora eventos que não possuem entrada no mapa de tags', () => {
    const tagsMap = {
      1: [{ id: 't1', nome: 'Backend', cor: '#2563eb' }],
    }
    const events = [{ id: '1' }, { id: '999' }]

    expect(filterTagsMapByEvents(tagsMap, events)).toEqual({
      1: [{ id: 't1', nome: 'Backend', cor: '#2563eb' }],
    })
  })

  it('retorna objeto vazio quando tagsMap ou events são inválidos', () => {
    expect(filterTagsMapByEvents(null, [{ id: '1' }])).toEqual({})
    expect(filterTagsMapByEvents({}, null)).toEqual({})
    expect(filterTagsMapByEvents(undefined, undefined)).toEqual({})
  })
})
