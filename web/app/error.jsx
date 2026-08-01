'use client'

import RouteError from '../components/RouteError'

export default function Error({ error, reset }) {
  return (
    <RouteError
      error={error}
      reset={reset}
      context="Home.error"
      message="Não foi possível carregar a página inicial. Verifique sua conexão e tente novamente."
    />
  )
}
