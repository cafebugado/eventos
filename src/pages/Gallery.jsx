import { useState, useCallback } from 'react'
import { Images } from 'lucide-react'
import Layout from '../layout/Layout'
import SEOHead from '../components/SEOHead'
import GalleryEventCard from '../components/gallery/GalleryEventCard'
import GalleryPhotoModal from '../components/gallery/GalleryPhotoModal'
import { useGallery } from '../hooks/useGallery'
import './Gallery.css'

function Gallery() {
  const { events } = useGallery()

  const [modal, setModal] = useState({ event: null, photoIndex: 0 })

  const openModal = useCallback((event, photoIndex = 0) => {
    setModal({ event, photoIndex })
  }, [])

  const closeModal = useCallback(() => {
    setModal({ event: null, photoIndex: 0 })
  }, [])

  const goToPrev = useCallback(() => {
    setModal((prev) => ({
      ...prev,
      photoIndex: Math.max(0, prev.photoIndex - 1),
    }))
  }, [])

  const goToNext = useCallback(() => {
    setModal((prev) => ({
      ...prev,
      photoIndex: Math.min(prev.event.photos.length - 1, prev.photoIndex + 1),
    }))
  }, [])

  const isEmpty = events.length === 0

  return (
    <Layout>
      <SEOHead
        title="Galeria"
        description="Galeria de fotos das comunidades e eventos presenciais do Cafe Bugado. Veja os melhores momentos de cada encontro."
        url={`${window.location.origin}/galeria`}
      />

      <main className="main-content">
        <section className="gallery-section">
          <div className="container">
            <h2>
              Galeria da <span className="highlight">Comunidade</span>
            </h2>
            <p className="section-description">
              Cada foto conta uma história. Aqui, pessoas de comunidades como{' '}
              <strong>Cafe Bugado</strong>, <strong>Meet Up Tech SP</strong> e muitas outras
              registram e compartilham os melhores momentos dos eventos presenciais que viveram
              juntas. Sua comunidade também pode fazer parte disso.
            </p>

            {isEmpty ? (
              <div className="gallery-empty">
                <Images size={48} />
                <p>Nenhum evento encontrado para os filtros selecionados.</p>
              </div>
            ) : (
              <div className="gallery-events-list">
                {events.map((event) => (
                  <GalleryEventCard key={event.id} event={event} onPhotoClick={openModal} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {modal.event && (
        <GalleryPhotoModal
          event={modal.event}
          photoIndex={modal.photoIndex}
          onClose={closeModal}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </Layout>
  )
}

export default Gallery
