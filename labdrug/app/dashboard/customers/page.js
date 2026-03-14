'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ customer_name: '', birth_date: '', gender: '', contacts: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const d = await fetch('/api/customers').then(r => r.json())
    setCustomers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  function openAdd() {
    setForm({ customer_name: '', birth_date: '', gender: '', contacts: '', address: '' })
    setError(''); setModal('add')
  }

  function openEdit(row) {
    setForm({ ...row, birth_date: row.birth_date ? row.birth_date.split('T')[0] : '' })
    setError(''); setModal('edit')
  }

  async function handleSave() {
    if (!form.customer_name) { setError('Customer name is required.'); return }
    setSaving(true); setError('')
    try {
      const method = modal === 'add' ? 'POST' : 'PUT'
      const url = modal === 'add' ? '/api/customers' : `/api/customers/${form.customer_id}`
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
      setModal(null); load()
    } catch { setError('Network error') }
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/customers/${confirmDelete.customer_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Cannot delete — customer has linked sales records.'); setConfirmDelete(null); return }
    setConfirmDelete(null); load()
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
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Customers</h2><p className="text-sm text-muted">Manage registered customer records</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>
      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div> : (
          <DataTable columns={columns} data={customers} searchKeys={['customer_name', 'contacts']}
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
              <span className="modal-title">{modal === 'add' ? 'Add Customer' : 'Edit Customer'}</span>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group"><label className="form-label">Full Name *</label><input value={form.customer_name || ''} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Full name" /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Birth Date</label><input type="date" value={form.birth_date || ''} onChange={e => setForm({ ...form, birth_date: e.target.value })} /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  value={form.contacts || ''}
                  onChange={e => setForm({ ...form, contacts: e.target.value.replace(/\D/g, '').slice(0,11) })}
                  placeholder="09XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={11}
                />
                <p className="form-hint">Numbers only, 11 digits</p>
              </div>
              <div className="form-group"><label className="form-label">Address</label><textarea rows={2} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Home address" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Add Customer' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body">
              <p>Delete customer <strong>{confirmDelete.customer_name}</strong>? This cannot be undone.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Deletion will fail if this customer has linked sales records.</p>
            </div>
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
