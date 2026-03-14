'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ supplier_name: '', contact_person: '', contact_number: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const d = await fetch('/api/suppliers').then(r => r.json())
    setSuppliers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  function openAdd() {
    setForm({ supplier_name: '', contact_person: '', contact_number: '', address: '' })
    setError(''); setModal('add')
  }

  function openEdit(row) {
    setForm({ ...row }); setError(''); setModal('edit')
  }

  async function handleSave() {
    if (!form.supplier_name) { setError('Supplier name is required.'); return }
    setSaving(true); setError('')
    try {
      const method = modal === 'add' ? 'POST' : 'PUT'
      const url = modal === 'add' ? '/api/suppliers' : `/api/suppliers/${form.supplier_id}`
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
      setModal(null); load()
    } catch { setError('Network error') }
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/suppliers/${confirmDelete.supplier_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Cannot delete — supplier has linked delivery records.'); setConfirmDelete(null); return }
    setConfirmDelete(null); load()
  }

  const columns = [
    { key: 'supplier_name', label: 'Supplier Name', render: r => <span className="font-medium">{r.supplier_name}</span> },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'contact_number', label: 'Contact Number' },
    { key: 'address', label: 'Address', render: r => <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address || '—'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Suppliers</h2><p className="text-sm text-muted">Manage pharmacy suppliers and contacts</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Supplier</button>
      </div>
      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div> : (
          <DataTable columns={columns} data={suppliers} searchKeys={['supplier_name', 'contact_person']}
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
              <span className="modal-title">{modal === 'add' ? 'Add Supplier' : 'Edit Supplier'}</span>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group"><label className="form-label">Supplier Name *</label><input value={form.supplier_name || ''} onChange={e => setForm({ ...form, supplier_name: e.target.value })} placeholder="e.g. Unilab Inc." /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Contact Person</label><input value={form.contact_person || ''} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="Full name" /></div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input value={form.contact_number || ''} onChange={e => setForm({ ...form, contact_number: e.target.value.replace(/\D/g, '').slice(0,11) })} placeholder="09XXXXXXXXX" inputMode="numeric" maxLength={11} />
                  <p className="form-hint">Numbers only, 11 digits</p>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Address</label><textarea rows={2} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Business address" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Add Supplier' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body">
              <p>Delete <strong>{confirmDelete.supplier_name}</strong>? This cannot be undone.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Deletion will fail if this supplier has linked delivery records.</p>
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
