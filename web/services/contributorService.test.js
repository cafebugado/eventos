import { describe, expect, it, vi } from 'vitest'
import { getContributors } from './contributorService'

function createMockSupabase({ data = null, error = null } = {}) {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve({ data, error })),
  }
  return { from: vi.fn(() => builder) }
}

describe('getContributors', () => {
  it('busca contribuintes ordenados por nome', async () => {
    const contributors = [
      { id: '1', nome: 'Ana' },
      { id: '2', nome: 'Bruno' },
    ]
    const supabase = createMockSupabase({ data: contributors })

    const result = await getContributors(supabase)

    expect(supabase.from).toHaveBeenCalledWith('contribuintes')
    expect(result).toEqual(contributors)
  })

  it('propaga erro do Supabase', async () => {
    const supabase = createMockSupabase({ error: new Error('falha de conexão') })

    await expect(getContributors(supabase)).rejects.toThrow('falha de conexão')
  })
})
