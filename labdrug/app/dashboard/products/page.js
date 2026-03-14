'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

const CLOSE = '✕'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [p, c, b] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/brands').then(r => r.json()),
    ])
    setProducts(Array.isArray(p) ? p : [])
    setCategories(Array.isArray(c) ? c : [])
    setBrands(Array.isArray(b) ? b : [])
    setLoading(false)
  }

  function openAdd() {
    setForm({ product_name: '', unit: '', price: '', category_id: '', description: '', brand_id: '', reorder_level: 10 })
    setError('')
    setModal('add')
  }

  function openEdit(row) {
    setForm({ ...row })
    setError('')
    setModal('edit')
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const method = modal === 'add' ? 'POST' : 'PUT'
      const url = modal === 'add' ? '/api/products' : `/api/products/${form.product_id}`
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
      setModal(null); loadData()
    } catch { setError('Network error') }
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/products/${confirmDelete.product_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Delete failed — product may have linked sales records.'); setConfirmDelete(null); return }
    setConfirmDelete(null); loadData()
  }

  const columns = [
    { key: 'product_name', label: 'Product Name', render: r => <span className="font-medium">{r.product_name}</span> },
    { key: 'brand_name', label: 'Brand' },
    { key: 'category_name', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'price', label: 'Price', style: { textAlign: 'right' }, render: r => `₱${Number(r.price).toFixed(2)}` },
    { key: 'current_stock', label: 'Stock', style: { textAlign: 'right' }, render: r => {
      const stock = Number(r.current_stock); const low = stock <= Number(r.reorder_level)
      return <span className={low ? 'text-danger font-medium' : ''}>{stock}{stock === 0 ? <span className="badge badge-danger" style={{ marginLeft: 4 }}>Out</span> : low ? <span className="badge badge-warning" style={{ marginLeft: 4 }}>Low</span> : null}</span>
    }},
    { key: 'reorder_level', label: 'Reorder At', style: { textAlign: 'right' } },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Products</h2><p className="text-sm text-muted">Manage medicines and pharmacy products</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>
      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div> : (
          <DataTable columns={columns} data={products} searchKeys={['product_name', 'brand_name', 'category_name']}
            actions={row => (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)}>Edit</button>
                <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fca5a5' }} onClick={() => setConfirmDelete(row)}>Delete</button>
              </div>
            )}
          />
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? 'Add New Product' : 'Edit Product'}</span>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>{CLOSE}</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-row">
                <div className="form-group"><label className="form-label">Product Name *</label><input value={form.product_name || ''} onChange={e => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Paracetamol 500mg" /></div>
                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select value={form.unit || ''} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="">Select unit</option>
                    {['tablet','capsule','bottle','box','sachet','ampule','vial','tube','piece'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <select value={form.brand_id || ''} onChange={e => setForm({ ...form, brand_id: e.target.value })}>
                    <option value="">Select brand</option>
                    {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Selling Price (₱) *</label><input type="number" step="0.01" min="0" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></div>
                <div className="form-group"><label className="form-label">Reorder Level *</label><input type="number" min="0" value={form.reorder_level || ''} onChange={e => setForm({ ...form, reorder_level: e.target.value })} placeholder="10" /><p className="form-hint">Alert when stock reaches this level</p></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body"><p>Delete <strong>{confirmDelete.product_name}</strong>? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
