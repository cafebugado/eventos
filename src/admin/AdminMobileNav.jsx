import { useState, useCallback } from 'react'
import {
  Calendar,
  Tag,
  Users,
  Settings,
  ExternalLink,
  UserCog,
  GitBranch,
  Images,
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
  { id: 'configuracoes', label: 'Configurações', icon: Settings, permission: null },
]

// eslint-disable-next-line no-unused-vars
function AdminMobileNavItem({ id, label, icon: Icon, isActive, index, onClick }) {
  return (
    <button
      className={`admin-mobile-nav-item${isActive ? ' active' : ''}`}
      onClick={() => onClick(id)}
      style={{ '--item-index': index }}
      aria-label={label}
    >
      <Icon size={20} />
      <span className="admin-mobile-nav-label">{label}</span>
    </button>
  )
}

export function AdminMobileNav({ activeTab, onTabChange, permissions }) {
  const [isOpen, setIsOpen] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), [])

  const closeMenu = useCallback(() => setIsOpen(false), [])

  const handleTabChange = useCallback(
    (id) => {
      onTabChange(id)
      closeMenu()
    },
    [onTabChange, closeMenu]
  )

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
            isActive={activeTab === id}
            index={index}
            onClick={handleTabChange}
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
