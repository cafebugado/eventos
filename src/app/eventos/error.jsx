'use client'

import RouteError from '../../components/RouteError'

export default function Error({ error, reset }) {
  return (
    <RouteError
      error={error}
      reset={reset}
      context="EventsPage.error"
      message="Não foi possível carregar os eventos. Verifique sua conexão e tente novamente."
    />
  )
}
