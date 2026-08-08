import { describe, expect, it } from 'vitest'
import { getLocationOptions } from './eventLocationOptions'

describe('getLocationOptions', () => {
  it('retorna array vazio quando não há eventos', () => {
    expect(getLocationOptions([])).toEqual([])
  })

  it('ignora eventos sem cidade (vazio, null, undefined ou só espaços)', () => {
    const events = [
      { cidade: '', modalidade: 'Presencial' },
      { cidade: null, modalidade: 'Presencial' },
      { modalidade: 'Presencial' },
      { cidade: '   ', modalidade: 'Presencial' },
    ]
    expect(getLocationOptions(events)).toEqual([])
  })

  it('remove cidades duplicadas', () => {
    const events = [
      { cidade: 'São Paulo', modalidade: 'Presencial' },
      { cidade: 'São Paulo', modalidade: 'Presencial' },
      { cidade: 'Belo Horizonte', modalidade: 'Presencial' },
    ]
    expect(getLocationOptions(events)).toEqual(['Belo Horizonte', 'São Paulo'])
  })

  it('inclui "Online" apenas quando houver evento com essa modalidade', () => {
    const semOnline = [{ cidade: 'Recife', modalidade: 'Presencial' }]
    expect(getLocationOptions(semOnline)).toEqual(['Recife'])

    const comOnline = [...semOnline, { modalidade: 'Online' }]
    expect(getLocationOptions(comOnline)).toEqual(['Online', 'Recife'])
  })

  it('ignora a cidade de eventos com modalidade Online, mesmo se cidade estiver preenchida', () => {
    const events = [{ cidade: 'São Paulo', modalidade: 'Online' }]
    expect(getLocationOptions(events)).toEqual(['Online'])
  })

  it('remove espaços em branco nas bordas do nome da cidade', () => {
    const events = [{ cidade: '  Curitiba  ', modalidade: 'Presencial' }]
    expect(getLocationOptions(events)).toEqual(['Curitiba'])
  })

  it('ordena o resultado alfabeticamente (pt-BR)', () => {
    const events = [
      { cidade: 'Salvador', modalidade: 'Presencial' },
      { cidade: 'Águas Claras', modalidade: 'Presencial' },
      { cidade: 'Belo Horizonte', modalidade: 'Presencial' },
      { modalidade: 'Online' },
    ]
    expect(getLocationOptions(events)).toEqual([
      'Águas Claras',
      'Belo Horizonte',
      'Online',
      'Salvador',
    ])
  })
})
