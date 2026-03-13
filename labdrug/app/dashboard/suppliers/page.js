'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ supplier_name: '', contact_person: '', contact_number: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const d = await fetch('/api/suppliers').then(r => r.json())
    setSuppliers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.supplier_name) { setError('Supplier name is required.'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
    setModal(false)
    setForm({ supplier_name: '', contact_person: '', contact_number: '', address: '' })
    load()
    setSaving(false)
  }

  const columns = [
    { key: 'supplier_name', label: 'Supplier Name', render: r => <span className="font-medium">{r.supplier_name}</span> },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'contact_number', label: 'Contact Number' },
    { key: 'address', label: 'Address', render: r => <span className="truncate" style={{ maxWidth: 200, display: 'block' }}>{r.address || '—'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Suppliers</h2>
          <p className="text-sm text-muted">Manage pharmacy suppliers and contacts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ supplier_name: '', contact_person: '', contact_number: '', address: '' }); setError(''); setModal(true) }}>+ Add Supplier</button>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          : <DataTable columns={columns} data={suppliers} searchKeys={['supplier_name', 'contact_person']} />}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Supplier</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group"><label className="form-label">Supplier Name *</label><input value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} placeholder="e.g. Unilab Inc." /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Contact Person</label><input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="Full name" /></div>
                <div className="form-group"><label className="form-label">Contact Number</label><input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} placeholder="09XXXXXXXXX" /></div>
              </div>
              <div className="form-group"><label className="form-label">Address</label><textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Business address" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Supplier'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
