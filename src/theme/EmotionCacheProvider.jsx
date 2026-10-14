'use client'

import { useState } from 'react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'

// Substitui o AppRouterCacheProvider do @mui/material-nextjs, que escreve os
// estilos no HTML na ordem em que os componentes renderizaram. Com streaming e
// os loading.jsx, essa ordem depende de quanto a API demora em cada
// regeneração: o mesmo conteúdo saía com as regras em ordens diferentes, e a
// Vercel cobrava uma escrita de ISR a cada regeneração (ver issue #408).
// Aqui os nomes são ordenados antes de virar <style>, então o HTML só muda
// quando o conteúdo muda. A ordem entre classes não altera o resultado: o
// Emotion junta os estilos de cada elemento numa classe só.
export default function EmotionCacheProvider({ options, children }) {
  const [registry] = useState(() => {
    const cache = createCache(options)
    cache.compat = true
    const prevInsert = cache.insert
    let inserted = []
    cache.insert = (...args) => {
      const [selector, serialized] = args
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push({ name: serialized.name, isGlobal: !selector })
      }
      return prevInsert(...args)
    }
    const flush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }
    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const inserted = registry.flush()
    if (inserted.length === 0) {
      return null
    }

    const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    const globals = []
    const names = []
    let styles = ''
    for (const { name, isGlobal } of [...inserted].sort(byName)) {
      const style = registry.cache.inserted[name]
      if (typeof style !== 'string') {
        continue
      }
      if (isGlobal) {
        globals.push({ name, style })
      } else {
        names.push(name)
        styles += style
      }
    }

    return (
      <>
        {globals.map(({ name, style }) => (
          <style
            key={name}
            data-emotion={`${registry.cache.key}-global ${name}`}
            dangerouslySetInnerHTML={{ __html: style }}
          />
        ))}
        {styles && (
          <style
            data-emotion={[registry.cache.key, ...names].join(' ')}
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        )}
      </>
    )
  })

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>
}
