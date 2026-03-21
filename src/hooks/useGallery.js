import { useState, useEffect, useMemo } from 'react'
import { getAlbuns } from '../services/galeriaService'

function normalizeAlbum(album) {
  const fotos = (album.galeria_fotos || [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem || new Date(a.created_at) - new Date(b.created_at))
    .map((foto) => ({
      id: foto.id,
      url: foto.url,
      thumb: foto.url,
      caption: foto.legenda || '',
      postedBy: foto.uploader_profile
        ? [foto.uploader_profile.nome, foto.uploader_profile.sobrenome].filter(Boolean).join(' ')
        : null,
      postedAt: foto.created_at ? new Date(foto.created_at).toLocaleDateString('pt-BR') : '',
    }))

  return {
    id: album.id,
    eventName: album.eventos?.nome || 'Sem evento',
    eventDate: album.eventos?.data_evento || '',
    community: album.comunidades?.nome || 'Sem comunidade',
    createdBy: album.user_profiles
      ? [album.user_profiles.nome, album.user_profiles.sobrenome].filter(Boolean).join(' ')
      : null,
    photos: fotos,
    _raw: album,
  }
}

export function useGallery() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('Todas')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAlbuns()
      .then((data) => {
        if (cancelled) {
          return
        }
        const normalized = data
          .filter((a) => (a.galeria_fotos || []).length > 0)
          .map(normalizeAlbum)
        setAlbums(normalized)
      })
      .catch((err) => {
        if (cancelled) {
          return
        }
        setError(err)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const communities = useMemo(() => {
    const names = albums.map((e) => e.community)
    return ['Todas', ...new Set(names)]
  }, [albums])

  const filteredEvents = useMemo(() => {
    return albums.filter((event) => {
      const matchesCommunity =
        selectedCommunity === 'Todas' || event.community === selectedCommunity
      const matchesSearch =
        !searchTerm ||
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.community.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCommunity && matchesSearch
    })
  }, [albums, searchTerm, selectedCommunity])

  return {
    events: filteredEvents,
    communities,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCommunity,
    setSelectedCommunity,
    totalPhotos: filteredEvents.reduce((acc, e) => acc + e.photos.length, 0),
  }
}
