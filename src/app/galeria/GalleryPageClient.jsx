'use client'

import { useCallback, useState } from 'react'
import Stack from '@mui/material/Stack'
import GalleryEventCard from '../../components/gallery/GalleryEventCard'
import GalleryPhotoModal from '../../components/gallery/GalleryPhotoModal'

// Client Component: só a interação do lightbox (abrir/fechar/navegar entre
// fotos) precisa rodar no cliente — a lista de álbuns já vem pronta do
// Server Component pai (app/galeria/page.jsx).
export default function GalleryPageClient({ events }) {
  const [modal, setModal] = useState({ event: null, photoIndex: 0 })

  const openModal = useCallback((event, photoIndex = 0) => {
    setModal({ event, photoIndex })
  }, [])

  const closeModal = useCallback(() => {
    setModal({ event: null, photoIndex: 0 })
  }, [])

  const goToPrev = useCallback(() => {
    setModal((prev) => ({ ...prev, photoIndex: Math.max(0, prev.photoIndex - 1) }))
  }, [])

  const goToNext = useCallback(() => {
    setModal((prev) => ({
      ...prev,
      photoIndex: Math.min(prev.event.photos.length - 1, prev.photoIndex + 1),
    }))
  }, [])

  const goToIndex = useCallback((index) => {
    setModal((prev) => ({ ...prev, photoIndex: index }))
  }, [])

  return (
    <>
      <Stack spacing={3}>
        {events.map((event) => (
          <GalleryEventCard key={event.id} event={event} onPhotoClick={openModal} />
        ))}
      </Stack>

      {modal.event && (
        <GalleryPhotoModal
          event={modal.event}
          photoIndex={modal.photoIndex}
          onClose={closeModal}
          onPrev={goToPrev}
          onNext={goToNext}
          onGoTo={goToIndex}
        />
      )}
    </>
  )
}
