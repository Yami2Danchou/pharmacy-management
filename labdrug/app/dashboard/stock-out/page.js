'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function StockOutPage() {
  const [records, setRecords] = useState([])
  const [products, setProducts] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [employeeId, setEmployeeId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1, description: 'expired' }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [r, p, e] = await Promise.all([
      fetch('/api/stock-out').then(d => d.json()),
      fetch('/api/products').then(d => d.json()),
      fetch('/api/employees').then(d => d.json()),
    ])
    setRecords(Array.isArray(r) ? r : [])
    setProducts(Array.isArray(p) ? p : [])
    setEmployees(Array.isArray(e) ? e : [])
    setLoading(false)
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function handleSubmit() {
    const valid = items.filter(i => i.product_id && i.quantity > 0)
    if (!valid.length) { setError('Add at least one item.'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/stock-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId || null, items: valid }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSubmitting(false); return }
    setModal(false)
    setItems([{ product_id: '', quantity: 1, description: 'expired' }])
    setEmployeeId('')
    loadAll()
    setSubmitting(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/stock-out/${confirmDelete.stock_out_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Delete failed.'); setConfirmDelete(null); return }
    setConfirmDelete(null); loadAll()
  }

  const columns = [
    { key: 'stock_out_id', label: '#', render: r => <span className="font-medium">#{r.stock_out_id}</span> },
    { key: 'stock_out_date', label: 'Date', render: r => new Date(r.stock_out_date).toLocaleDateString('en-PH') },
    { key: 'employee_name', label: 'Employee', render: r => r.employee_name || '—' },
    { key: 'item_count', label: 'Items', style: { textAlign: 'center' } },
    { key: 'username', label: 'Recorded By' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Stock Out</h2><p className="text-sm text-muted">Record lost, expired, or damaged products</p></div>
        <button className="btn btn-primary" onClick={() => { setError(''); setModal(true) }}>+ Record Stock Out</button>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div> : (
          <DataTable columns={columns} data={records} searchKeys={['employee_name', 'username']}
            actions={row => (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fca5a5' }} onClick={() => setConfirmDelete(row)}>Delete</button>
              </div>
            )}
          />
        )}
      </div>

      {/* Add Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <span className="modal-title">Record Stock Out</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group mb-4">
                <label className="form-label">Employee</label>
                <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.employee_name}</option>)}
                </select>
              </div>
              <table>
                <thead><tr><th>Product</th><th style={{ width: 80 }}>Qty</th><th style={{ width: 130 }}>Reason</th><th style={{ width: 40 }}></th></tr></thead>
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
                      <td>
                        <select value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}>
                          <option value="expired">Expired</option>
                          <option value="damaged">Damaged</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td><button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} disabled={items.length === 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => setItems(p => [...p, { product_id: '', quantity: 1, description: 'expired' }])}>+ Add Row</button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Record Stock Out'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body"><p>Delete stock out record <strong>#{confirmDelete.stock_out_id}</strong> from <strong>{new Date(confirmDelete.stock_out_date).toLocaleDateString('en-PH')}</strong>? This cannot be undone.</p></div>
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
