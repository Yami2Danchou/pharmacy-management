'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function ReturnsPage() {
  const [returns, setReturns] = useState([])
  const [products, setProducts] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ return_type: 'Defective', reason: '', verified_by_employee_id: '', sale_id: '', customer_name: '' })
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [r, p, e] = await Promise.all([
      fetch('/api/returns').then(d => d.json()),
      fetch('/api/products').then(d => d.json()),
      fetch('/api/employees').then(d => d.json()),
    ])
    setReturns(Array.isArray(r) ? r : [])
    setProducts(Array.isArray(p) ? p : [])
    setEmployees(Array.isArray(e) ? e : [])
    setLoading(false)
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function handleSubmit() {
    if (!form.reason || !form.verified_by_employee_id) { setError('Reason and verifying employee are required.'); return }
    const valid = items.filter(i => i.product_id && i.quantity > 0)
    if (!valid.length) { setError('Add at least one item.'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sale_id: form.sale_id || null, items: valid }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSubmitting(false); return }
    setModal(false)
    setForm({ return_type: 'Defective', reason: '', verified_by_employee_id: '', sale_id: '', customer_name: '' })
    setItems([{ product_id: '', quantity: 1 }])
    loadAll()
    setSubmitting(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/returns/${confirmDelete.return_product_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Delete failed.'); setConfirmDelete(null); return }
    setConfirmDelete(null); loadAll()
  }

  const columns = [
    { key: 'return_product_id', label: '#', render: r => <span className="font-medium">#{r.return_product_id}</span> },
    { key: 'return_date', label: 'Date', render: r => new Date(r.return_date).toLocaleDateString('en-PH') },
    { key: 'return_type', label: 'Type', render: r => <span className={`badge ${r.return_type === 'Resellable' ? 'badge-success' : 'badge-warning'}`}>{r.return_type}</span> },
    { key: 'customer_name', label: 'Customer', render: r => r.customer_name || '—' },
    { key: 'reason', label: 'Reason' },
    { key: 'verified_by', label: 'Verified By' },
    { key: 'item_count', label: 'Items', style: { textAlign: 'center' } },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Product Returns</h2><p className="text-sm text-muted">Process and track product returns</p></div>
        <button className="btn btn-primary" onClick={() => { setError(''); setModal(true) }}>+ New Return</button>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div> : (
          <DataTable columns={columns} data={returns} searchKeys={['customer_name', 'reason', 'return_type']}
            actions={row => (
              <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fca5a5' }} onClick={() => setConfirmDelete(row)}>Delete</button>
            )}
          />
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <span className="modal-title">Process Return</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Return Type *</label>
                  <select value={form.return_type} onChange={e => setForm({ ...form, return_type: e.target.value })}>
                    <option value="Defective">Defective</option>
                    <option value="Resellable">Resellable</option>
                    <option value="Expired">Expired</option>
                    <option value="Wrong Item">Wrong Item</option>
                  </select>
                  <p className="form-hint">Resellable items will be added back to stock</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Verified By *</label>
                  <select value={form.verified_by_employee_id} onChange={e => setForm({ ...form, verified_by_employee_id: e.target.value })}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.employee_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Customer Name</label><input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Customer name" /></div>
                <div className="form-group"><label className="form-label">Sale # (if applicable)</label><input type="number" value={form.sale_id} onChange={e => setForm({ ...form, sale_id: e.target.value })} placeholder="e.g. 42" /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea rows={2} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Describe the reason for return..." />
              </div>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Returned Items</div>
              <table>
                <thead><tr><th>Product</th><th style={{ width: 80 }}>Qty</th><th style={{ width: 40 }}></th></tr></thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                          <option value="">Select product</option>
                          {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
                        </select>
                      </td>
                      <td><input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ textAlign: 'center' }} /></td>
                      <td><button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} disabled={items.length === 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => setItems(p => [...p, { product_id: '', quantity: 1 }])}>+ Add Row</button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Submit Return'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body"><p>Delete return record <strong>#{confirmDelete.return_product_id}</strong>? This cannot be undone.</p></div>
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
