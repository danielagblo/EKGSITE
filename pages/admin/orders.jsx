import React from 'react'
import { useRouter } from 'next/router'
import {
  Search,
  ShoppingBag,
  FileText,
  User,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  Mail,
  Box,
  MapPin,
  MessageSquare,
  Clock,
  Eye,
  Trash2
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'

export default function AdminOrders() {
  const router = useRouter()
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [sortBy, setSortBy] = React.useState('newest')
  const [viewItem, setViewItem] = React.useState(null)

  React.useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) {
      router.replace('/admin/login')
      return
    }
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
          if (res.status === 401) {
            localStorage.removeItem('admin_token')
            router.replace('/admin/login')
            return
          }
          if (!res.ok) throw new Error('Failed to load orders')
          const data = await res.json()
          if (mounted) setOrders(Array.isArray(data) ? data : [])
        } catch (e) { if (mounted) setError(e.message || String(e)) }
        if (mounted) setLoading(false)
      })()

    const onHeaderSearch = (e) => setSearch(String(e.detail || ''))
    window.addEventListener('admin:search', onHeaderSearch)
    return () => {
      mounted = false
      window.removeEventListener('admin:search', onHeaderSearch)
    }
  }, [router])

  const filtered = orders.filter(o => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      (o.productName || '').toLowerCase().includes(q) ||
      (o.name || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q)
    )
  }).sort((a, b) => {
    if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '')
    if (sortBy === 'oldest') return (a.id || '').localeCompare(b.id || '')
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
    return 0
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch (e) { return dateStr }
  }

  const updateStatus = async (id, status) => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      setOrders(prev => prev.map(o => o.id === id ? updated : o))
      setViewItem(updated)
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(false)
    }
  }
  
  const deleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return
    setUpdating(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to delete order')
      setOrders(prev => prev.filter(o => o.id !== id))
      if (viewItem?.id === id) setViewItem(null)
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <AdminLayout title="Orders">
      <div className="page-header">
        <h1 className="page-title">Manage Orders</h1>
        <p className="page-subtitle">View and manage rental requests</p>
      </div>

      <div className="toolbar-row">
        <div className="toolbar-left">
          <div className="search-field">
            <Search className="search-icon" size={18} />
            <input
              placeholder="Search by customer, vehicle or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <select
            className="btn btn-outline"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Customer Name</option>
          </select>
        </div>
      </div>

      {loading && <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading Orders...</div>}
      {error && <div className="danger" style={{ marginBottom: 16, padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 32px', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)' }}>
          <Box size={60} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.2 }} />
          <h3 className="empty-title" style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>No orders found</h3>
          <p className="empty-subtitle" style={{ fontSize: 14, color: 'var(--text-muted)' }}>Try adjusting your search terms or filters</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <section className="card-grid">
          {filtered.map(o => (
            <article key={o.id} className="model-card" style={{ padding: '20px 28px', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="card-content-left" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <div className="card-avatar" style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(227, 6, 19, 0.1)', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                  <ShoppingBag size={24} />
                </div>
                <div className="card-info" style={{ flex: 1 }}>
                  <div className="card-info-header" style={{ marginBottom: 12 }}>
                    <span className="card-name" style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{o.productName}</span>
                    <span className="id-pill" style={{ background: 'var(--glass)', color: 'var(--text-muted)', padding: '4px 12px', fontSize: 10, fontWeight: 800, borderRadius: 99 }}>#{o.id}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <User size={14} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <Calendar size={14} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                      <span>{formatDate(o.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <Mail size={14} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                      <span style={{ opacity: 0.8 }}>{o.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)', fontSize: 14, fontWeight: 800 }}>
                      <TrendingUp size={14} />
                      <span>{o.price || o.rate} GHS</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <MapPin size={14} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                      <span>{o.location || 'Main Terminal'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <Clock size={14} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.start} → {o.end}</span>
                    </div>
                  </div>

                  {o.note && (
                    <div style={{
                      marginTop: 24,
                      padding: '16px 20px',
                      background: 'var(--glass)',
                      borderRadius: 16,
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      gap: 12,
                      border: '1px solid var(--border)',
                      lineHeight: 1.6
                    }}>
                      <MessageSquare size={16} style={{ flexShrink: 0, marginTop: 4, color: 'var(--primary)', opacity: 0.6 }} />
                      <div style={{ fontStyle: 'italic' }}>"{o.note}"</div>
                    </div>
                  )}
                  {o.status === 'Approved' && (
                    <div style={{ marginTop: 12, color: '#10b981', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TrendingUp size={14} /> APPROVED
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  className="btn btn-edit"
                  onClick={() => setViewItem(o)}
                  style={{ width: 44, height: 44, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <a
                  className="btn btn-primary"
                  href={`/api/invoice/${o.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', height: 44, padding: '0 20px', fontSize: 13 }}
                >
                  <FileText size={16} />
                  <span>Invoice</span>
                </a>
                <button
                  className="btn btn-outline"
                  onClick={() => deleteOrder(o.id)}
                  style={{ width: 44, height: 44, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                  title="Delete Order"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <Modal open={!!viewItem} title="Order Details" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><strong>Order ID:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.id}</span></div>
              <div><strong>Date:</strong> <span style={{ color: 'var(--text-secondary)' }}>{formatDate(viewItem.createdAt)}</span></div>
              <div><strong>Customer Name:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.name}</span></div>
              <div><strong>Email:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.email}</span></div>
              <div><strong>Phone:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.phone || '-'}</span></div>
              <div><strong>Vehicle/Product:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.productName}</span></div>
              <div><strong>Price:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.price || viewItem.rate} GHS</span></div>
              <div><strong>Duration:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.start} to {viewItem.end}</span></div>
              <div><strong>Location:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.location || 'Main Terminal'}</span></div>
              <div><strong>Status:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.status || 'Pending'}</span></div>
            </div>

            {viewItem.note && (
              <div>
                <strong>Additional Customer Notes:</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: 8, padding: 16, background: 'var(--glass)', borderRadius: 12, border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
                  {viewItem.note}
                </div>
              </div>
            )}

            <div className="form-actions" style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
              {viewItem.status !== 'Approved' && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(viewItem.id, 'Approved')}
                  disabled={updating}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  {updating ? 'Processing...' : 'Approve Order'}
                </button>
              )}
              {viewItem.status === 'Approved' && (
                <div style={{ color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                  <TrendingUp size={16} /> Order Approved & Notified
                </div>
              )}
              <button
                className="btn btn-outline"
                onClick={() => deleteOrder(viewItem.id)}
                disabled={updating}
                style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
              >
                <Trash2 size={16} /> {updating ? '...' : 'Delete'}
              </button>
              <button className="btn btn-outline" onClick={() => setViewItem(null)} style={{ marginLeft: 'auto' }}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

AdminOrders.noLayout = true
