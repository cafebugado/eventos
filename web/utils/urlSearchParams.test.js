import { describe, expect, it } from 'vitest'
import { withUpdatedParams } from './urlSearchParams'

describe('withUpdatedParams', () => {
  it('adiciona novos parâmetros preservando os existentes', () => {
    const result = withUpdatedParams(new URLSearchParams('page=2'), { q: 'react' })
    expect(result).toBe('page=2&q=react')
  })

  it('remove a chave quando o valor é vazio/false/null/undefined', () => {
    const result = withUpdatedParams(new URLSearchParams('q=react&past=1'), {
      q: '',
      past: false,
    })
    expect(result).toBe('')
  })

  it('converte true para "1"', () => {
    const result = withUpdatedParams(new URLSearchParams(''), { fav: true })
    expect(result).toBe('fav=1')
  })

  it('remove o parâmetro page quando resetPage=true', () => {
    const result = withUpdatedParams(
      new URLSearchParams('page=3&q=react'),
      { tag: '5' },
      {
        resetPage: true,
      }
    )
    expect(result).toBe('q=react&tag=5')
  })
})
