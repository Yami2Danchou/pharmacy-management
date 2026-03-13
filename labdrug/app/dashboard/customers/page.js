'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ customer_name: '', birth_date: '', gender: '', contacts: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const d = await fetch('/api/customers').then(r => r.json())
    setCustomers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.customer_name) { setError('Customer name is required.'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
    setModal(false)
    setForm({ customer_name: '', birth_date: '', gender: '', contacts: '', address: '' })
    load()
    setSaving(false)
  }

  const columns = [
    { key: 'customer_name', label: 'Name', render: r => <span className="font-medium">{r.customer_name}</span> },
    { key: 'gender', label: 'Gender' },
    { key: 'birth_date', label: 'Birth Date', render: r => r.birth_date ? new Date(r.birth_date).toLocaleDateString('en-PH') : '—' },
    { key: 'contacts', label: 'Contact' },
    { key: 'address', label: 'Address', render: r => r.address || '—' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Customers</h2>
          <p className="text-sm text-muted">Manage registered customer records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ customer_name: '', birth_date: '', gender: '', contacts: '', address: '' }); setError(''); setModal(true) }}>+ Add Customer</button>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          : <DataTable columns={columns} data={customers} searchKeys={['customer_name', 'contacts']} />}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Customer</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group"><label className="form-label">Full Name *</label><input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Full name" /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Birth Date</label><input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Contact Number</label><input value={form.contacts} onChange={e => setForm({ ...form, contacts: e.target.value })} placeholder="09XXXXXXXXX" /></div>
              </div>
              <div className="form-group"><label className="form-label">Address</label><textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Home address" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Customer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
