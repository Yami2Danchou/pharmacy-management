'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSupplyPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState([])
  const [employees, setEmployees] = useState([])
  const [products, setProducts] = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1, supply_amount: '', batch_code: '', expirationdate: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/suppliers').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([s, e, p]) => {
      setSuppliers(Array.isArray(s) ? s : [])
      setEmployees(Array.isArray(e) ? e : [])
      setProducts(Array.isArray(p) ? p : [])
    })
  }, [])

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setItems(prev => [...prev, { product_id: '', quantity: 1, supply_amount: '', batch_code: '', expirationdate: '' }])
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const total = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.supply_amount) || 0), 0)

  async function handleSubmit() {
    if (!supplierId) { setError('Please select a supplier.'); return }
    const validItems = items.filter(i => i.product_id && i.quantity > 0 && i.supply_amount && i.batch_code)
    if (validItems.length === 0) { setError('Add at least one complete item (product, qty, cost, batch).'); return }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier_id: supplierId, employee_id: employeeId || null, items: validItems }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); setSubmitting(false); return }
      router.push('/dashboard/supplies')
    } catch { setError('Network error') }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Record Supply Delivery</h2>
          <p className="text-sm text-muted">Add incoming stock from a supplier</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.push('/dashboard/supplies')}>← Back</button>
      </div>

      {error && <div className="alert alert-danger mb-4">⚠ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>
        <div>
          {/* Supplier & Employee */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Delivery Details</span></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Supplier *</label>
                  <select value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Received By (Employee)</label>
                  <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.employee_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Delivered Products</span>
              <button className="btn btn-outline btn-sm" onClick={addItem}>+ Add Row</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ minWidth: 200 }}>Product *</th>
                    <th style={{ width: 80 }}>Qty *</th>
                    <th style={{ width: 110 }}>Cost/Unit *</th>
                    <th style={{ width: 120 }}>Batch Code *</th>
                    <th style={{ width: 140 }}>Expiry Date</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                          <option value="">Select product</option>
                          {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
                        </select>
                      </td>
                      <td>
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ textAlign: 'center' }} />
                      </td>
                      <td>
                        <input type="number" step="0.01" min="0" value={item.supply_amount} onChange={e => updateItem(idx, 'supply_amount', e.target.value)} placeholder="0.00" />
                      </td>
                      <td>
                        <input value={item.batch_code} onChange={e => updateItem(idx, 'batch_code', e.target.value)} placeholder="e.g. LOT001" />
                      </td>
                      <td>
                        <input type="date" value={item.expirationdate} onChange={e => updateItem(idx, 'expirationdate', e.target.value)} />
                      </td>
                      <td>
                        <button onClick={() => removeItem(idx)} disabled={items.length === 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '1rem' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <div className="card-header"><span className="card-title">Summary</span></div>
          <div className="card-body">
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>Total Items</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{items.filter(i => i.product_id).length}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>Total Cost</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem' }}>₱{total.toFixed(2)}</div>
            <button
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '0.75rem' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : '✓ Save Delivery'}
            </button>
            <button className="btn btn-outline w-full" style={{ marginTop: '0.5rem', justifyContent: 'center' }} onClick={() => router.push('/dashboard/supplies')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
