'use client'

import RouteError from '../../components/RouteError'

export default function Error({ error, reset }) {
  return (
    <RouteError
      error={error}
      reset={reset}
      context="GalleryPage.error"
      message="Não foi possível carregar a galeria. Verifique sua conexão e tente novamente."
    />
  )
}
