import { useState, useMemo } from 'react'

// Dados mockados — substituir por chamadas ao Supabase futuramente
const MOCK_GALLERY_EVENTS = [
  {
    id: '1',
    eventName: 'DevFest Goiânia 2024',
    eventDate: '15/11/2024',
    community: 'MEET_UP_TECH_SP',
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        caption: 'Abertura do evento',
        postedBy: 'Carlos Mendes',
        postedAt: '16/11/2024',
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        thumb: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
        caption: 'Palestra principal',
        postedBy: 'Ana Lima',
        postedAt: '16/11/2024',
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
        thumb: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
        caption: 'Networking coffee break',
        postedBy: 'João Silva',
        postedAt: '17/11/2024',
      },
      {
        id: 'p4',
        url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
        thumb: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400',
        caption: 'Workshop de Flutter',
        postedBy: 'Mariana Costa',
        postedAt: '17/11/2024',
      },
      {
        id: 'p5',
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
        thumb: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
        caption: 'Encerramento e premiação',
        postedBy: 'Rafael Torres',
        postedAt: '18/11/2024',
      },
    ],
  },
  {
    id: '2',
    eventName: 'Cafe Bugado Meetup #12',
    eventDate: '23/10/2024',
    community: 'Cafe Bugado',
    photos: [
      {
        id: 'p6',
        url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
        thumb: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
        caption: 'Turma reunida',
        postedBy: 'Fernanda Souza',
        postedAt: '24/10/2024',
      },
      {
        id: 'p7',
        url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800',
        thumb: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400',
        caption: 'Talk sobre React 19',
        postedBy: 'Diego Alves',
        postedAt: '24/10/2024',
      },
      {
        id: 'p8',
        url: 'https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=800',
        thumb: 'https://images.unsplash.com/photo-1582192730841-2a682d7375f9?w=400',
        caption: 'Mesa de debates',
        postedBy: 'Camila Rocha',
        postedAt: '25/10/2024',
      },
    ],
  },
  {
    id: '3',
    eventName: 'PyBR 2024',
    eventDate: '05/09/2024',
    community: 'ConectaDev',
    photos: [
      {
        id: 'p9',
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        thumb: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
        caption: 'Auditório principal',
        postedBy: 'Luiza Ferreira',
        postedAt: '06/09/2024',
      },
      {
        id: 'p10',
        url: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800',
        thumb: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400',
        caption: 'Sprint de código',
        postedBy: 'Bruno Cardoso',
        postedAt: '06/09/2024',
      },
      {
        id: 'p11',
        url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
        thumb: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        caption: 'Hackathon noturno',
        postedBy: 'Patricia Nunes',
        postedAt: '07/09/2024',
      },
      {
        id: 'p12',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        thumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
        caption: 'Encerramento',
        postedBy: 'Thiago Martins',
        postedAt: '08/09/2024',
      },
    ],
  },
  {
    id: '4',
    eventName: 'Women in Tech Goiás',
    eventDate: '12/08/2024',
    community: 'Cafe Bugado',
    photos: [
      {
        id: 'p13',
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        thumb: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        caption: 'Painel de palestrantes',
        postedBy: 'Beatriz Oliveira',
        postedAt: '13/08/2024',
      },
      {
        id: 'p14',
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
        thumb: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
        caption: 'Mentoria em grupo',
        postedBy: 'Juliana Pereira',
        postedAt: '13/08/2024',
      },
    ],
  },
]

export function useGallery() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('Todas')

  const communities = useMemo(() => {
    const names = MOCK_GALLERY_EVENTS.map((e) => e.community)
    return ['Todas', ...new Set(names)]
  }, [])

  const filteredEvents = useMemo(() => {
    return MOCK_GALLERY_EVENTS.filter((event) => {
      const matchesCommunity =
        selectedCommunity === 'Todas' || event.community === selectedCommunity
      const matchesSearch =
        !searchTerm ||
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.community.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCommunity && matchesSearch
    })
  }, [searchTerm, selectedCommunity])

  return {
    events: filteredEvents,
    communities,
    searchTerm,
    setSearchTerm,
    selectedCommunity,
    setSelectedCommunity,
    totalPhotos: filteredEvents.reduce((acc, e) => acc + e.photos.length, 0),
  }
}
