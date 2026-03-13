'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', role: 'Cashier', employee_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [u, e] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ])
    setUsers(Array.isArray(u) ? u : [])
    setEmployees(Array.isArray(e) ? e : [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.username || !form.password || !form.employee_id) { setError('All fields are required.'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
    setModal(false)
    setForm({ username: '', password: '', role: 'Cashier', employee_id: '' })
    loadAll()
    setSaving(false)
  }

  const roleBadge = role => {
    const map = { Admin: 'badge-danger', Manager: 'badge-warning', Cashier: 'badge-info' }
    return <span className={`badge ${map[role] || 'badge-gray'}`}>{role}</span>
  }

  const columns = [
    { key: 'username', label: 'Username', render: r => <span className="font-medium">@{r.username}</span> },
    { key: 'role', label: 'Role', render: r => roleBadge(r.role) },
    { key: 'employee_name', label: 'Employee' },
    { key: 'is_active', label: 'Status', render: r => <span className={`badge ${r.is_active ? 'badge-success' : 'badge-gray'}`}>{r.is_active ? 'Active' : 'Inactive'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>User Accounts</h2>
          <p className="text-sm text-muted">Manage system user accounts and roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ username: '', password: '', role: 'Cashier', employee_id: '' }); setError(''); setModal(true) }}>+ Add User</button>
      </div>

      <div className="alert alert-info mb-4">
        🔐 <strong>Role Permissions:</strong> Admin — full access · Manager — sales, supplies, reports, stock-out · Cashier — sales and inventory view only
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          : <DataTable columns={columns} data={users} searchKeys={['username', 'employee_name', 'role']} />}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add User Account</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-row">
                <div className="form-group"><label className="form-label">Username *</label><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. jdelacruz" autoComplete="off" /></div>
                <div className="form-group"><label className="form-label">Password *</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" autoComplete="new-password" /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employee *</label>
                  <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.employee_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
