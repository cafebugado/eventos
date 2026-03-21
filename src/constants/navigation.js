import { Home, Calendar, Users, Images, Mail } from 'lucide-react'

export const ROUTES = {
  HOME: '/',
  EVENTS: '/eventos',
  EVENT_DETAIL: '/eventos/:id',
  ABOUT: '/sobre',
  GALLERY: '/galeria',
  CONTACT: '/contato',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
}

export const NAVIGATION_ITEMS = [
  { path: ROUTES.HOME, label: 'Inicio', icon: Home },
  { path: ROUTES.EVENTS, label: 'Eventos', icon: Calendar },
  { path: ROUTES.ABOUT, label: 'Sobre', icon: Users },
  { path: ROUTES.GALLERY, label: 'Galeria', icon: Images },
  { path: ROUTES.CONTACT, label: 'Contato', icon: Mail },
]
