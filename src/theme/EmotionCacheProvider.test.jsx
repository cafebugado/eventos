// @vitest-environment node
// No navegador o Emotion grava `true` em cache.inserted em vez do CSS; o
// caminho de SSR, que é o que vai pro HTML das páginas, só roda sem `document`.
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import styled from '@emotion/styled'
import { Global } from '@emotion/react'
import EmotionCacheProvider from './EmotionCacheProvider'

let insertedHTML
vi.mock('next/navigation', () => ({
  useServerInsertedHTML: (callback) => {
    insertedHTML = callback
  },
}))

const Red = styled.div({ color: 'red' })
const Blue = styled.div({ color: 'blue' })
const Green = styled.div({ color: 'green' })

function renderStyles(children) {
  renderToStaticMarkup(
    <EmotionCacheProvider options={{ key: 'mui' }}>{children}</EmotionCacheProvider>
  )
  return renderToStaticMarkup(insertedHTML())
}

describe('EmotionCacheProvider', () => {
  it('gera o mesmo HTML de estilos independente da ordem de renderização', () => {
    const forward = renderStyles(
      <>
        <Red />
        <Blue />
        <Green />
      </>
    )
    const backward = renderStyles(
      <>
        <Green />
        <Blue />
        <Red />
      </>
    )

    expect(forward).toBe(backward)
    expect(forward).toContain('color:red')
    expect(forward).toContain('color:blue')
    expect(forward).toContain('color:green')
  })

  it('lista os nomes em ordem no data-emotion', () => {
    const html = renderStyles(
      <>
        <Green />
        <Red />
        <Blue />
      </>
    )
    const names = html.match(/data-emotion="mui ([^"]*)"/)[1].split(' ')

    expect(names).toHaveLength(3)
    expect(names).toEqual([...names].sort())
  })

  it('separa estilos globais numa tag própria', () => {
    const html = renderStyles(
      <>
        <Global styles={{ body: { margin: 0 } }} />
        <Red />
      </>
    )

    expect(html).toMatch(/<style data-emotion="mui-global [^"]+">body\{margin:0;\}<\/style>/)
    expect(html).toContain('color:red')
  })

  it('não gera nada quando não há estilo novo desde o último flush', () => {
    renderStyles(<Red />)

    expect(insertedHTML()).toBeNull()
  })
})
