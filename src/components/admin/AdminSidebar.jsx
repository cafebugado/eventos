import React from 'react'
import { Calendar, Users, Plus, ExternalLink, LogOut, Tag } from 'lucide-react'

const AdminSidebar = ({ activeTab, setActiveTab, openCreateModal, userEmail, handleLogout }) => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Eventos</h2>
        <span>Café Bugado Admin</span>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`menu-item ${activeTab === 'eventos' ? 'active' : ''}`}
          onClick={() => setActiveTab('eventos')}
        >
          <Calendar size={20} />
          <span>Eventos</span>
        </button>
        <button
          className={`menu-item ${activeTab === 'criar' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('criar')
            openCreateModal()
          }}
        >
          <Plus size={20} />
          <span>Criar Evento</span>
        </button>
        <button
          className={`menu-item ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          <Tag size={20} />
          <span>Tags</span>
        </button>
        <button
          className={`menu-item ${activeTab === 'contribuintes' ? 'active' : ''}`}
          onClick={() => setActiveTab('contribuintes')}
        >
          <Users size={20} />
          <span>Contribuintes</span>
        </button>
        <button className="menu-item" onClick={() => window.open('/', '_blank')}>
          <ExternalLink size={20} />
          <span>Ver Site</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{userEmail?.charAt(0).toUpperCase() || 'A'}</div>
          <div className="user-details">
            <span className="user-name">Admin</span>
            <span className="user-email">{userEmail}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
