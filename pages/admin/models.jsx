import React from 'react'
import { useRouter } from 'next/router'
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Box,
  Eye
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import CldOptimizedImage from '../../components/CldOptimizedImage'

function empty() {
  return {
    name: '',
    category: '',
    price: '',
    image: '',
    desc: '',
    status: 'active',
    range: '',
    rangeUnit: 'km',
    topSpeed: '',
    topSpeedUnit: 'km/h',
    zeroToSixty: '',
    zeroToSixtyUnit: 's',
    rate: '',
    features: '',
    gallery: [],
    specs: {
      battery: '',
      drive: '',
      seats: '',
      charging: '',
      transmission: '',
      fuelType: ''
    }
  }
}

export default function AdminModels() {
  const router = useRouter()
  const [editingId, setEditingId] = React.useState(null)
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [form, setForm] = React.useState(empty())
  const [showCreate, setShowCreate] = React.useState(false)
  const [imagePreview, setImagePreview] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('all')
  const [sortBy, setSortBy] = React.useState('newest')
  const [viewItem, setViewItem] = React.useState(null)

  const sameId = React.useCallback((a, b) => String(a) === String(b), [])

  React.useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!token) { router.replace('/admin/login'); return }
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch('/api/models', { headers: { Authorization: `Bearer ${token}` } })
          if (res.status === 401) {
            localStorage.removeItem('admin_token')
            router.replace('/admin/login')
            return
          }
          if (!res.ok) throw new Error('Failed to load models')
          const data = await res.json()
          if (mounted) setItems(Array.isArray(data) ? data : [])
        } catch (e) { if (mounted) setError(e.message || String(e)) }
        if (mounted) setLoading(false)
      })()
    const onHeaderSearch = (e) => setSearch(String(e.detail || ''))
    window.addEventListener('admin:search', onHeaderSearch)
    return () => { mounted = false; window.removeEventListener('admin:search', onHeaderSearch) }
  }, [router])

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function onSpecChange(e) {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      specs: {
        ...(f.specs || {}),
        [name]: value
      }
    }))
  }

  async function onImageFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const token = localStorage.getItem('admin_token')

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setForm(f => ({ ...f, image: data.url }))
    } catch (err) {
      setError('Image upload failed: ' + (err.message || String(err)))
    }
  }

  async function onGalleryFile(e) {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return

    const token = localStorage.getItem('admin_token')
    
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('image', file)
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')

        setForm(f => ({
          ...f,
          gallery: [...(f.gallery || []), data.url]
        }))
      } catch (err) {
        setError('Gallery upload failed: ' + (err.message || String(err)))
      }
    }
  }

  function removeFromGallery(index) {
    setForm(f => ({
      ...f,
      gallery: (f.gallery || []).filter((_, i) => i !== index)
    }))
  }

  function edit(item) {
    setForm({
      name: item.name || '',
      category: item.category || '',
      price: item.price || '',
      image: item.image || '',
      desc: item.desc || '',
      status: item.status || 'active',
      range: item.range || '',
      rangeUnit: item.rangeUnit || 'km',
      topSpeed: item.topSpeed || '',
      topSpeedUnit: item.topSpeedUnit || 'km/h',
      zeroToSixty: item.zeroToSixty || '',
      zeroToSixtyUnit: item.zeroToSixtyUnit || 's',
      rate: item.rate || '',
      specs: {
        battery: item.specs?.battery || '',
        drive: item.specs?.drive || '',
        seats: item.specs?.seats || '',
        charging: item.specs?.charging || '',
        transmission: item.specs?.transmission || '',
        fuelType: item.specs?.fuelType || ''
      },
      features: Array.isArray(item.features) ? item.features.join(', ') : (item.features || ''),
      gallery: Array.isArray(item.gallery) ? item.gallery : []
    })
    setEditingId(item.id)
    setImagePreview(item.image || '')
    setShowCreate(true)
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    const token = localStorage.getItem('admin_token')
    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/models/${editingId}` : '/api/models'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'}`)
      const item = await res.json()

      if (editingId) {
        setItems(s => s.map(i => sameId(i.id, editingId) ? item : i))
      } else {
        setItems(s => [item, ...s])
      }

      setForm(empty())
      setEditingId(null)
      setImagePreview('')
      setShowCreate(false)
    } catch (e) { setError(e.message || String(e)) }
  }

  async function remove(id) {
    if (!confirm('Delete this model?')) return
    setError('')
    const token = localStorage.getItem('admin_token')
    try {
      const res = await fetch(`/api/models/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error('Failed to delete')
      setItems(s => s.filter(i => !sameId(i.id, id)))
    } catch (e) { setError(e.message || String(e)) }
  }

  const filtered = items.filter(i => {
    const q = search.trim().toLowerCase()
    if (q && !(`${i.name} ${i.category} ${i.desc} ${i.id}`.toLowerCase()).includes(q)) return false
    if (filterStatus !== 'all' && (i.status || 'active') !== filterStatus) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'newest') return (b.id || 0).toString().localeCompare((a.id || 0).toString())
    if (sortBy === 'oldest') return (a.id || 0).toString().localeCompare((b.id || 0).toString())
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
    return 0
  })

  return (
    <AdminLayout title="Models">
      <div className="page-header">
        <h1 className="page-title">Manage Models</h1>
        <p className="page-subtitle">/models</p>
      </div>

      <div className="toolbar-row">
        <div className="toolbar-left">
          <div className="search-field">
            <Search className="search-icon" size={18} />
            <input
              className="models-search"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="btn btn-outline"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '0 12px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="toolbar-right">
          <select
            className="btn btn-outline"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '0 12px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setForm(empty()); setEditingId(null); setImagePreview(''); setShowCreate(true); }}>
            <Plus size={20} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading Models...</div>}
      {error && <div className="danger" style={{ marginBottom: 16, padding: 12, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8 }}>{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 32px', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)' }}>
          <Box size={60} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.2 }} />
          <h3 className="empty-title" style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>No models found</h3>
          <p className="empty-subtitle" style={{ fontSize: 14, color: 'var(--text-muted)' }}>Try adjusting your search terms or filters</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: 24, height: 44 }}>Add First Vehicle</button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card-grid">
          {filtered.map(item => (
            <article key={item.id} className="model-card" style={{ padding: '20px 28px', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="card-content-left" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ position: 'relative' }}>
                  <CldOptimizedImage
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    width={100}
                    height={64}
                    style={{ width: 100, height: 64, borderRadius: 12, objectFit: 'cover', background: '#000', border: '1px solid var(--border)' }}
                  />
                  {Array.isArray(item.gallery) && item.gallery.length > 0 && (
                    <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--primary)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 900, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '2px solid var(--bg-card)' }}>
                      +{item.gallery.length}
                    </div>
                  )}
                </div>
                <div className="card-info">
                  <div className="card-info-header" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="card-name" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{item.name}</span>
                    <span className={`status-pill status-${item.status || 'active'}`} style={{ fontSize: 10 }}>{item.status || 'Active'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.price || item.rate} GHS</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span>{item.category || 'Luxury'}</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span className="id-pill" style={{ background: 'var(--glass)', color: 'var(--text-muted)', padding: '2px 8px', fontSize: 10, borderRadius: 99 }}>#{item.id}</span>
                  </div>
                </div>
              </div>

              <div className="card-actions" style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-edit"
                  onClick={() => setViewItem(item)}
                  style={{ width: 44, height: 44, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  className="btn btn-edit"
                  onClick={() => edit(item)}
                  style={{ width: 44, height: 44, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Edit Model"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => remove(item.id)}
                  style={{ width: 44, height: 44, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Delete Model"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={showCreate} title={editingId ? "Edit Model" : "Create Model"} onClose={() => setShowCreate(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-col">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>General Info</h3>

              <label className="field-label">Model Name</label>
              <input name="name" placeholder="e.g. Mercedes Benz C300" value={form.name} onChange={onChange} required />

              <label className="field-label">Category</label>
              <select name="category" value={form.category} onChange={onChange}>
                <option value="">Select a category</option>
                <option value="Luxury">Luxury (Elite)</option>
                <option value="Executive">Executive</option>
                <option value="Sport">Sport</option>
                <option value="Economy">Economy</option>
                <option value="Cargo">Cargo/Utility</option>
                <option value="Motorcycle">Motorcycle</option>
              </select>

              <label className="field-label">Daily Price (GHS)</label>
              <input name="price" placeholder="e.g. 1200" value={form.price} onChange={onChange} />

              <label className="field-label">Description</label>
              <textarea name="desc" placeholder="Brief description of the vehicle" value={form.desc} onChange={onChange} style={{ minHeight: 100 }} />

              <label className="field-label">Included Features (comma separated)</label>
              <textarea
                name="features"
                placeholder="e.g. Autopilot, Premium Audio, Climate Control"
                value={form.features}
                onChange={onChange}
                style={{ minHeight: 80, fontSize: 13 }}
              />
            </div>

            <div className="form-col">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Technical Details</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="field-label">Range</label>
                  <div style={{ display: 'flex' }}>
                    <input name="range" placeholder="500" value={form.range} onChange={onChange} style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }} />
                    <select name="rangeUnit" value={form.rangeUnit} onChange={onChange} style={{ width: 70, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '0 8px', background: 'var(--bg-body)' }}>
                      <option value="km">km</option>
                      <option value="mi">mi</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="field-label">Seats</label>
                  <input name="seats" placeholder="5" value={form.specs?.seats} onChange={onSpecChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="field-label">Top Speed</label>
                  <div style={{ display: 'flex' }}>
                    <input name="topSpeed" placeholder="250" value={form.topSpeed} onChange={onChange} style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }} />
                    <select name="topSpeedUnit" value={form.topSpeedUnit} onChange={onChange} style={{ width: 85, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '0 8px', background: 'var(--bg-body)' }}>
                      <option value="km/h">km/h</option>
                      <option value="mph">mph</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="field-label">Acceleration</label>
                  <div style={{ display: 'flex' }}>
                    <input name="zeroToSixty" placeholder="4.5" value={form.zeroToSixty} onChange={onChange} style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }} />
                    <select name="zeroToSixtyUnit" value={form.zeroToSixtyUnit} onChange={onChange} style={{ width: 60, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '0 8px', background: 'var(--bg-body)' }}>
                      <option value="s">s</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="field-label">Transmission</label>
                  <select name="transmission" value={form.specs?.transmission} onChange={onSpecChange}>
                    <option value="">Select</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                    <option value="Direct Drive">Direct Drive</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Fuel Type</label>
                  <select name="fuelType" value={form.specs?.fuelType} onChange={onSpecChange}>
                    <option value="">Select</option>
                    <option value="Electric">Electric</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Plug-in Hybrid">PHEV</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="field-label">Power Unit</label>
                  <select name="battery" value={form.specs?.battery} onChange={onSpecChange}>
                    <option value="">Select</option>
                    <option value="60 kWh">60 kWh</option>
                    <option value="80 kWh">80 kWh</option>
                    <option value="100 kWh">100 kWh</option>
                    <option value="2.0L I4">2.0L I4 Turbo</option>
                    <option value="3.0L V6">3.0L V6 Turbo</option>
                    <option value="4.0L V8">4.0L V8 Biturbo</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Drive Type</label>
                  <select name="drive" value={form.specs?.drive} onChange={onSpecChange}>
                    <option value="">Select</option>
                    <option value="AWD">AWD</option>
                    <option value="RWD">RWD</option>
                    <option value="FWD">FWD</option>
                    <option value="4WD">4×4</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--glass)' }}>
            <label className="field-label">Primary Hero Image</label>
            <div className="input-group-row" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <input name="image" placeholder="Image URL" value={form.image} onChange={onChange} style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or</span>
              <label className="btn btn-outline" style={{ margin: 0, height: 44, padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <span style={{ whiteSpace: 'nowrap' }}>Upload Hero</span>
                <input type="file" accept="image/*" onChange={onImageFile} style={{ display: 'none' }} />
              </label>
            </div>
            {imagePreview && (
              <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 20 }}>
                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => { setForm(f => ({ ...f, image: '' })); setImagePreview(''); }}
                  style={{ position: 'absolute', top: 10, right: 10, padding: '6px 12px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', fontSize: 11, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                >
                  Remove Hero
                </button>
              </div>
            )}

            <label className="field-label" style={{ marginTop: 24 }}>Gallery Images (Multiple)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginTop: 8 }}>
              {(form.gallery || []).map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '100%', paddingTop: '66%', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: '#000' }}>
                  <img src={url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="gallery" />
                  <button 
                    type="button" 
                    onClick={() => removeFromGallery(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, background: 'rgba(239, 68, 68, 0.95)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="btn btn-outline" style={{ width: '100%', height: 0, paddingTop: 'calc(66% - 2px)', position: 'relative', cursor: 'pointer', borderStyle: 'dashed', background: 'transparent' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Plus size={20} />
                  <span style={{ fontSize: 10 }}>Add</span>
                </div>
                <input type="file" multiple accept="image/*" onChange={onGalleryFile} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn btn-outline" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save Changes' : 'Create Model'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewItem} title="Model Details" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {viewItem.image && (
              <img src={viewItem.image} alt={viewItem.name} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 16 }} />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><strong>Name:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.name}</span></div>
              <div><strong>Category:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.category}</span></div>
              <div><strong>Price:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.price || viewItem.rate} GHS</span></div>
              <div><strong>Status:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.status}</span></div>
              <div><strong>Top Speed:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.topSpeed ? `${viewItem.topSpeed} ${viewItem.topSpeedUnit || ''}` : '-'}</span></div>
              <div><strong>Acceleration:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.zeroToSixty ? `${viewItem.zeroToSixty} ${viewItem.zeroToSixtyUnit || ''}` : '-'}</span></div>
              <div><strong>Range:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.range ? `${viewItem.range} ${viewItem.rangeUnit || ''}` : '-'}</span></div>
              <div><strong>Transmission:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.specs?.transmission || '-'}</span></div>
              <div><strong>Fuel Type:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.specs?.fuelType || '-'}</span></div>
              <div><strong>Power Unit:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.specs?.battery || '-'}</span></div>
              <div><strong>Drive Type:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.specs?.drive || '-'}</span></div>
              <div><strong>Seats:</strong> <span style={{ color: 'var(--text-secondary)' }}>{viewItem.specs?.seats || '-'}</span></div>
            </div>

            <div>
              <strong>Description:</strong>
              <div style={{ color: 'var(--text-secondary)', marginTop: 8, padding: 16, background: 'var(--glass)', borderRadius: 12, border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
                {viewItem.desc || 'No description provided.'}
              </div>
            </div>

            <div>
              <strong>Gallery:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 8 }}>
                {Array.isArray(viewItem.gallery) && viewItem.gallery.length > 0 ? (
                  viewItem.gallery.map((g, i) => (
                    <img key={i} src={g} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} alt="gallery" />
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No gallery images.</span>
                )}
              </div>
            </div>

            <div>
              <strong>Features:</strong>
              <div style={{ color: 'var(--text-secondary)', marginTop: 8, padding: 16, background: 'var(--glass)', borderRadius: 12, border: '1px solid var(--border)' }}>
                {Array.isArray(viewItem.features) ? viewItem.features.join(', ') : (viewItem.features || 'None')}
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-outline" onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

    </AdminLayout>
  )
}

AdminModels.noLayout = true
