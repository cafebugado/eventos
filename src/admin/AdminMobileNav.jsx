import { useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Calendar,
  Tag,
  Users,
  Settings,
  ExternalLink,
  UserCog,
  GitBranch,
  Images,
  ShieldCheck,
  X,
  Menu,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import './AdminMobileNav.css'

const MENU_ITEMS = [
  { id: 'eventos', label: 'Eventos', icon: Calendar, permission: null },
  { id: 'tags', label: 'Tags', icon: Tag, permission: 'canManageTags' },
  { id: 'contribuintes', label: 'Contribuintes', icon: Users, permission: 'canManageContributors' },
  { id: 'repositorio', label: 'Repositório', icon: GitBranch, permission: 'canManageContributors' },
  { id: 'usuarios', label: 'Usuários', icon: UserCog, permission: 'canManageUsers' },
  { id: 'comunidades', label: 'Comunidades', icon: Users, permission: null },
  { id: 'galeria', label: 'Galeria', icon: Images, permission: null },
  { id: 'auditoria', label: 'Auditoria', icon: ShieldCheck, permission: 'canManageUsers' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, permission: null },
]

function AdminMobileNavItem({ id, label, icon, index, onClick }) {
  const ItemIcon = icon
  return (
    <NavLink
      to={`/admin/dashboard/${id}`}
      className={({ isActive }) => `admin-mobile-nav-item${isActive ? ' active' : ''}`}
      style={{ '--item-index': index }}
      aria-label={label}
      onClick={onClick}
    >
      <ItemIcon size={20} />
      <span className="admin-mobile-nav-label">{label}</span>
    </NavLink>
  )
}

export function AdminMobileNav({ permissions }) {
  const [isOpen, setIsOpen] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), [])

  const closeMenu = useCallback(() => setIsOpen(false), [])

  const handleVerSite = useCallback(() => {
    window.open('/', '_blank')
    closeMenu()
  }, [closeMenu])

  const visibleItems = MENU_ITEMS.filter(({ permission }) => !permission || permissions[permission])

  return (
    <div className="admin-mobile-nav-container">
      {/* Overlay */}
      <div
        className={`admin-mobile-nav-overlay${isOpen ? ' active' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Menu Items */}
      <nav className={`admin-mobile-nav${isOpen ? ' active' : ''}`} aria-label="Menu mobile admin">
        {visibleItems.map(({ id, label, icon }, index) => (
          <AdminMobileNavItem
            key={id}
            id={id}
            label={label}
            icon={icon}
            index={index}
            onClick={closeMenu}
          />
        ))}

        <button
          className="admin-mobile-nav-item"
          onClick={handleVerSite}
          style={{ '--item-index': visibleItems.length }}
          aria-label="Ver Site"
        >
          <ExternalLink size={20} />
          <span className="admin-mobile-nav-label">Ver Site</span>
        </button>

        <button
          className="admin-mobile-nav-item admin-mobile-theme-toggle"
          onClick={toggleTheme}
          style={{ '--item-index': visibleItems.length + 1 }}
          aria-label={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="admin-mobile-nav-label">{isDarkMode ? 'Claro' : 'Escuro'}</span>
        </button>
      </nav>

      {/* FAB */}
      <button
        className={`admin-mobile-fab${isOpen ? ' active' : ''}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
      >
        <span className="admin-mobile-fab-icon">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </span>
      </button>
    </div>
  )
}
