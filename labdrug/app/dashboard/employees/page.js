'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ employee_name: '', employee_gender: '', employee_age: '', employee_address: '', employee_contacts: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const d = await fetch('/api/employees').then(r => r.json())
    setEmployees(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.employee_name) { setError('Employee name is required.'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
    setModal(false)
    setForm({ employee_name: '', employee_gender: '', employee_age: '', employee_address: '', employee_contacts: '' })
    load()
    setSaving(false)
  }

  const columns = [
    { key: 'employee_name', label: 'Name', render: r => <span className="font-medium">{r.employee_name}</span> },
    { key: 'employee_gender', label: 'Gender' },
    { key: 'employee_age', label: 'Age', style: { textAlign: 'center' } },
    { key: 'employee_contacts', label: 'Contact' },
    { key: 'employee_address', label: 'Address', render: r => <span className="truncate" style={{ maxWidth: 200, display: 'block' }}>{r.employee_address || '—'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Employees</h2>
          <p className="text-sm text-muted">Manage pharmacy staff records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ employee_name: '', employee_gender: '', employee_age: '', employee_address: '', employee_contacts: '' }); setError(''); setModal(true) }}>+ Add Employee</button>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          : <DataTable columns={columns} data={employees} searchKeys={['employee_name', 'employee_contacts']} />}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Employee</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group"><label className="form-label">Full Name *</label><input value={form.employee_name} onChange={e => setForm({ ...form, employee_name: e.target.value })} placeholder="Full name" /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select value={form.employee_gender} onChange={e => setForm({ ...form, employee_gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Age</label><input type="number" min="18" max="99" value={form.employee_age} onChange={e => setForm({ ...form, employee_age: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Contact Number</label><input value={form.employee_contacts} onChange={e => setForm({ ...form, employee_contacts: e.target.value })} placeholder="09XXXXXXXXX" /></div>
              <div className="form-group"><label className="form-label">Address</label><textarea rows={2} value={form.employee_address} onChange={e => setForm({ ...form, employee_address: e.target.value })} placeholder="Home address" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Employee'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
