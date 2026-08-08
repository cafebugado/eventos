import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEventFilters } from './useEventFilters'

const { useSearchParamsMock, replaceMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(() => new URLSearchParams()),
  replaceMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, refresh: vi.fn() }),
  usePathname: () => '/eventos',
  useSearchParams: useSearchParamsMock,
}))

const events = [
  {
    id: '1',
    nome: 'Workshop React',
    descricao: 'Aprenda hooks na prática',
    data_evento: '01/01/2999',
    cidade: 'São Paulo',
    modalidade: 'Presencial',
  },
  {
    id: '2',
    nome: 'Meetup Node',
    descricao: 'Backend do zero',
    data_evento: '01/01/2999',
    cidade: 'Belo Horizonte',
    modalidade: 'Presencial',
  },
  {
    id: '3',
    nome: 'Live de encerramento',
    descricao: 'Bate-papo aberto',
    data_evento: '01/01/2999',
    modalidade: 'Online',
  },
  {
    id: '4',
    nome: 'Evento antigo em São Paulo',
    descricao: '',
    data_evento: '01/01/2000',
    cidade: 'São Paulo',
    modalidade: 'Presencial',
  },
]

const eventTagsMap = {
  1: [{ id: 1, nome: 'React' }],
  2: [{ id: 2, nome: 'Node' }],
}

const favouriteIds = new Set(['2'])

function setup(query = '') {
  useSearchParamsMock.mockReturnValue(new URLSearchParams(query))
  return renderHook(() => useEventFilters(events, eventTagsMap, favouriteIds))
}

describe('useEventFilters', () => {
  beforeEach(() => {
    replaceMock.mockClear()
  })

  it('sem parâmetros na URL, oculta eventos passados e mantém os demais', () => {
    const { result } = setup()
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3'])
    expect(result.current.selectedLocation).toBe('')
    expect(result.current.filterActiveCount).toBe(0)
  })

  it('filtra por termo de busca (?q=) no nome e na descrição', () => {
    const { result } = setup('q=hooks')
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1'])
  })

  it('filtra por tag (?tag=)', () => {
    const { result } = setup('tag=2')
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['2'])
  })

  it('inclui eventos passados quando ?past=1', () => {
    const { result } = setup('past=1')
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3', '4'])
  })

  it('filtra só favoritos quando ?fav=1', () => {
    const { result } = setup('fav=1')
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['2'])
  })

  it('filtra por intervalo de datas (?from=&to=)', () => {
    const { result } = setup('from=1999-12-31&to=1999-12-31')
    expect(result.current.filteredEvents).toEqual([])
  })

  it('filtra por cidade (?local=<cidade>)', () => {
    const { result } = setup('local=São Paulo')
    expect(result.current.selectedLocation).toBe('São Paulo')
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1'])
  })

  it('filtra por modalidade Online (?local=Online)', () => {
    const { result } = setup('local=Online')
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['3'])
  })

  it('combina local com outro filtro em AND (?local=&q=)', () => {
    const { result } = setup('local=São Paulo&q=react')
    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1'])
  })

  it('inclui selectedLocation no filterActiveCount', () => {
    const { result } = setup('local=Online')
    expect(result.current.filterActiveCount).toBe(1)
  })

  it('setSelectedLocation atualiza a URL via router.replace', () => {
    const { result } = setup()

    act(() => {
      result.current.setSelectedLocation('Online')
    })

    expect(replaceMock).toHaveBeenCalledWith('/eventos?local=Online', { scroll: false })
  })

  it('setSelectedLocation reseta a página atual (?page=) ao trocar o filtro', () => {
    const { result } = setup('page=3')

    act(() => {
      result.current.setSelectedLocation('Online')
    })

    expect(replaceMock).toHaveBeenCalledWith('/eventos?local=Online', { scroll: false })
  })

  it('limpar o local (string vazia) remove o parâmetro da URL', () => {
    const { result } = setup('local=Online')

    act(() => {
      result.current.setSelectedLocation('')
    })

    expect(replaceMock).toHaveBeenCalledWith('/eventos', { scroll: false })
  })
})
