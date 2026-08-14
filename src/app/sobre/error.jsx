'use client'

import RouteError from '../../components/RouteError'

export default function Error({ error, reset }) {
  return (
    <RouteError
      error={error}
      reset={reset}
      context="AboutPage.error"
      message="Não foi possível carregar esta página. Verifique sua conexão e tente novamente."
    />
  )
}
