import { useState, useCallback } from 'react'
import {
  Calendar,
  LogOut,
  Tag,
  Users,
  Settings,
  ExternalLink,
  UserCog,
  GitBranch,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const MENU_ITEMS = [
  { id: 'eventos', label: 'Eventos', icon: Calendar, permission: null },
  { id: 'tags', label: 'Tags', icon: Tag, permission: 'canManageTags' },
  {
    id: 'contribuintes',
    label: 'Contribuintes',
    icon: Users,
    permission: 'canManageContributors',
  },
  {
    id: 'repositorio',
    label: 'Repositório',
    icon: GitBranch,
    permission: 'canManageContributors',
  },
  { id: 'usuarios', label: 'Usuários', icon: UserCog, permission: 'canManageUsers' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, permission: null },
]

function SidebarTooltip({ label, anchorY }) {
  if (!label) {
    return null
  }
  return (
    <div className="sidebar-tooltip" style={{ top: anchorY }}>
      {label}
    </div>
  )
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  permissions,
  userProfile,
  userEmail,
  userRole,
  roleLabels,
  onLogout,
  isCollapsed,
  onToggle,
}) {
  const [tooltip, setTooltip] = useState({ label: '', y: 0 })

  const showTooltip = useCallback((e, label) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ label, y: rect.top + rect.height / 2 })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip({ label: '', y: 0 })
  }, [])

  const displayName = userProfile?.nome
    ? `${userProfile.nome}${userProfile.sobrenome ? ` ${userProfile.sobrenome}` : ''}`
    : userRole
      ? roleLabels[userRole] || userRole
      : 'Sem Role'

  const roleLabel = userRole ? roleLabels[userRole] || userRole : 'Sem Role'

  const tooltipHandlers = (label) =>
    isCollapsed ? { onMouseEnter: (e) => showTooltip(e, label), onMouseLeave: hideTooltip } : {}

  return (
    <>
      <aside
        className={`admin-sidebar${isCollapsed ? ' admin-sidebar--collapsed' : ''}`}
        aria-label="Menu lateral"
      >
        {/* Header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-header-text">
              <h2>Eventos</h2>
              <span>Café Bugado Admin</span>
            </div>
          )}
          <button
            className="sidebar-toggle-btn"
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-menu">
          {/* eslint-disable-next-line no-unused-vars */}
          {MENU_ITEMS.map(({ id, label, icon: Icon, permission }) => {
            if (permission && !permissions[permission]) {
              return null
            }
            return (
              <button
                key={id}
                className={`menu-item${activeTab === id ? ' active' : ''}`}
                onClick={() => onTabChange(id)}
                aria-label={label}
                {...tooltipHandlers(label)}
              >
                <Icon size={isCollapsed ? 28 : 20} />
                {!isCollapsed && <span>{label}</span>}
              </button>
            )
          })}

          <button
            className="menu-item"
            onClick={() => window.open('/', '_blank')}
            aria-label="Ver Site"
            {...tooltipHandlers('Ver Site')}
          >
            <ExternalLink size={isCollapsed ? 28 : 20} />
            {!isCollapsed && <span>Ver Site</span>}
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt="avatar"
                className="user-avatar user-avatar-img"
              />
            ) : (
              <div className="user-avatar">{userEmail?.charAt(0).toUpperCase() || 'A'}</div>
            )}
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{displayName}</span>
                <span className="user-email">{roleLabel}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout} title="Sair" aria-label="Sair">
            <LogOut size={isCollapsed ? 28 : 20} />
          </button>
        </div>
      </aside>

      {isCollapsed && <SidebarTooltip label={tooltip.label} anchorY={tooltip.y} />}
    </>
  )
}
