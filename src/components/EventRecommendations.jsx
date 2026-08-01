'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import EventCard from './EventCard'
import { getRecommendedEvents } from '../services/eventService'
import { useFavouritesStore } from '../store/useFavouritesStore'

// Client Component deliberadamente NÃO alimentado pelo Server Component pai
// (app/eventos/[slug]/page.jsx): busca as recomendações no browser, e só
// dispara a busca quando a seção entra na viewport (IntersectionObserver) —
// mesma otimização de lazy-load do app antigo, preservada aqui.
export default function EventRecommendations({ currentEvent }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const sectionRef = useRef(null)

  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const toggleFavouriteInStore = useFavouritesStore((state) => state.toggleFavourite)
  const toggleFavourite = (eventId) => toggleFavouriteInStore(eventId, recommendations)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) {
      return undefined
    }

    if (!('IntersectionObserver' in window)) {
      // setState num callback (setTimeout), não sincronamente no corpo do
      // effect — ver convenção em EventCard.jsx (campo `isNew`).
      const timeoutId = setTimeout(() => setTriggered(true), 0)
      return () => clearTimeout(timeoutId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!triggered || !currentEvent) {
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const results = await getRecommendedEvents(currentEvent.id, 3)
        if (!cancelled) {
          setRecommendations(results)
        }
      } catch (err) {
        console.error('Erro ao carregar recomendações:', err)
        if (!cancelled) {
          setRecommendations([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentEvent é um objeto novo a cada render do pai; usar currentEvent?.id evita loop
  }, [triggered, currentEvent?.id])

  if (!triggered && !loading) {
    return <Box ref={sectionRef} aria-hidden="true" sx={{ height: 1 }} />
  }

  if (!loading && recommendations.length === 0) {
    return null
  }

  return (
    <Box component="section" ref={sectionRef} sx={{ py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={0.5} sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2">
            Você também pode gostar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Eventos relacionados baseados nos seus interesses.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`rec-skeleton-${i}`} variant="rounded" height={340} />
              ))
            : recommendations.map((rec) => (
                <EventCard
                  key={rec.id}
                  event={rec}
                  tags={rec.tags || []}
                  favouriteIds={favouriteIds}
                  toggleFavourite={toggleFavourite}
                />
              ))}
        </Box>

        <Stack sx={{ alignItems: 'center', mt: 4 }}>
          <Button component={Link} href="/eventos" endIcon={<ArrowForwardOutlinedIcon />}>
            Ver todos os eventos
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}
