'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { section: 'Main' },
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'Transactions' },
  { href: '/dashboard/sales', icon: '🛒', label: 'Sales' },
  { href: '/dashboard/returns', icon: '↩', label: 'Returns' },
  { href: '/dashboard/stock-out', icon: '📤', label: 'Stock Out' },
  { section: 'Inventory' },
  { href: '/dashboard/inventory', icon: '📦', label: 'Inventory' },
  { href: '/dashboard/expiration', icon: '⏰', label: 'Expiration Monitor' },
  { href: '/dashboard/products', icon: '💊', label: 'Products' },
  { section: 'Supply Chain' },
  { href: '/dashboard/supplies', icon: '🚚', label: 'Supply Deliveries' },
  { href: '/dashboard/suppliers', icon: '🏭', label: 'Suppliers' },
  { section: 'Data' },
  { href: '/dashboard/customers', icon: '👥', label: 'Customers' },
  { href: '/dashboard/employees', icon: '👤', label: 'Employees' },
  { section: 'Reports' },
  { href: '/dashboard/reports', icon: '📋', label: 'Reports' },
  { section: 'Admin' },
  { href: '/dashboard/users', icon: '🔐', label: 'User Accounts' },
]

function roleHidden(href, role) {
  const adminOnly = ['/dashboard/users', '/dashboard/employees']
  const managerPlus = ['/dashboard/reports', '/dashboard/stock-out']
  if (adminOnly.includes(href) && role === 'Cashier') return true
  if (managerPlus.includes(href) && role === 'Cashier') return true
  return false
}

export default function DashboardShell({ session, children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const initials = session.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">✚</div>
          <div>
            <div className="logo-text">Labdrug</div>
            <div className="logo-sub">Pharmacy System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="sidebar-section">{item.section}</div>
            }
            if (roleHidden(item.href, session.role)) return null
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', truncate: true }}>{session.username}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.65 }}>{session.role}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1rem' }} title="Logout">⏻</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <button
            className="btn btn-outline btn-sm"
            style={{ display: 'none' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div>
            <div className="page-title">Labdrug Pharmacy</div>
            <div className="page-subtitle">Sales & Inventory Management</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            <span>🕐 {new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  )
}
