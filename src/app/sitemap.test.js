import { describe, expect, it } from 'vitest'
import sitemap from './sitemap'

describe('sitemap', () => {
  it('retorna só as rotas estáticas (sem fonte de dados até a nova API ser plugada)', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)

    expect(urls).toEqual([
      'https://eventos.cafebugado.com.br/',
      'https://eventos.cafebugado.com.br/eventos',
      'https://eventos.cafebugado.com.br/sobre',
      'https://eventos.cafebugado.com.br/galeria',
      'https://eventos.cafebugado.com.br/contato',
    ])
  })
})
