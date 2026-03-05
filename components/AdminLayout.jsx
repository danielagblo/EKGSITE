import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  ShoppingCart,
  Box,
  Newspaper,
  MessageSquare,
  ChevronRight,
  LogOut,
  Settings,
  Sun,
  Moon
} from 'lucide-react'

export default function AdminLayout({ title, children }) {
  const router = useRouter()
  const path = router?.pathname || ''
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('admin_theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function handleLogout(e) {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }
  }

  const nav = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { href: '/admin/models', label: 'Models', icon: <Box size={20} /> },
    { href: '/admin/news', label: 'News', icon: <Newspaper size={20} /> },
    { href: '/admin/testimonials', label: 'Testimonials', icon: <MessageSquare size={20} /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> }
  ]

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-logo-area">
          <div className="sidebar-logo">EKG <span style={{ color: 'var(--primary)' }}>LOGISTICS</span></div>
          <div className="admin-badge" style={{ marginLeft: 8 }}>HQ</div>
        </div>

        <div className="sidebar-scrollable-section" style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          <div className="sidebar-section-label">Management</div>
          <nav className="admin-nav">
            {nav.map(item => {
              const isActive = path === item.href
              return (
                <Link key={item.href} href={item.href} className={isActive ? 'active' : ''}>

                  <div style={{ color: isActive ? '#fff' : 'inherit' }}>{item.icon}</div>
                  <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>

                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">EK</div>
            <div className="user-info">
              <div className="user-role">Super Admin</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ padding: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, color: '#FF3B30', cursor: 'pointer', display: 'flex' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div className="breadcrumb">
            <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800 }}>Admin Portal</span>
            <ChevronRight size={14} style={{ opacity: 0.3 }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{title}</span>
          </div>

          <div className="header-right">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{
                background: 'var(--glass)',
                border: '1px solid var(--border)',
                padding: '10px 18px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </span>
            </button>
            <div className="divider" style={{ opacity: 0.1, background: 'var(--text-primary)' }}></div>
            <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 12, borderRadius: 14 }}>EK</div>
          </div>
        </header>

        <main className="admin-content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
}
