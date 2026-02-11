import React from 'react'
import { LayoutDashboard, Sun, Moon } from 'lucide-react'

const AdminTopbar = ({ onToggleTheme, isDarkMode }) => {
  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <LayoutDashboard size={24} />
        <h1>Dashboard</h1>
      </div>
      <div className="topbar-right">
        <button className="theme-btn" onClick={onToggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}

export default AdminTopbar
