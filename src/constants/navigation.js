import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'

export const ROUTES = {
  HOME: '/',
  EVENTS: '/eventos',
  EVENT_DETAIL: '/eventos/[slug]',
  ABOUT: '/sobre',
  GALLERY: '/galeria',
  CONTACT: '/contato',
  FAVOURITES: '/favoritos',
}

export const NAVIGATION_ITEMS = [
  { path: ROUTES.HOME, label: 'Inicio', icon: HomeOutlinedIcon },
  { path: ROUTES.EVENTS, label: 'Eventos', icon: CalendarMonthOutlinedIcon },
  { path: ROUTES.ABOUT, label: 'Sobre', icon: GroupsOutlinedIcon },
  { path: ROUTES.GALLERY, label: 'Galeria', icon: CollectionsOutlinedIcon },
  { path: ROUTES.CONTACT, label: 'Contato', icon: MailOutlineIcon },
  { path: ROUTES.FAVOURITES, label: 'Favoritos', icon: FavoriteBorderOutlinedIcon },
]
