'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', role: 'Cashier', employee_id: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

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

  function openAdd() {
    setForm({ username: '', password: '', role: 'Cashier', employee_id: '', is_active: true })
    setError(''); setModal('add')
  }

  function openEdit(row) {
    setForm({ ...row, password: '' }); setError(''); setModal('edit')
  }

  async function handleSave() {
    if (!form.username || !form.employee_id) { setError('Username and employee are required.'); return }
    if (modal === 'add' && !form.password) { setError('Password is required for new accounts.'); return }
    setSaving(true); setError('')
    try {
      const method = modal === 'add' ? 'POST' : 'PUT'
      const url = modal === 'add' ? '/api/users' : `/api/users/${form.user_id}`
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
      setModal(null); loadAll()
    } catch { setError('Network error') }
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/users/${confirmDelete.user_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Cannot delete this account.'); setConfirmDelete(null); return }
    setConfirmDelete(null); loadAll()
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
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>User Accounts</h2><p className="text-sm text-muted">Manage system user accounts and roles</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
      </div>

      <div className="alert alert-info mb-4">
        🔐 <strong>Roles:</strong> Admin — full access · Manager — sales, supplies, reports · Cashier — sales and inventory only
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div> : (
          <DataTable columns={columns} data={users} searchKeys={['username', 'employee_name', 'role']}
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
              <span className="modal-title">{modal === 'add' ? 'Add User Account' : 'Edit User Account'}</span>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-row">
                <div className="form-group"><label className="form-label">Username *</label><input value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. jdelacruz" autoComplete="off" /></div>
                <div className="form-group">
                  <label className="form-label">{modal === 'add' ? 'Password *' : 'New Password'}</label>
                  <input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={modal === 'edit' ? 'Leave blank to keep current' : 'Min. 6 characters'} autoComplete="new-password" />
                  {modal === 'edit' && <p className="form-hint">Leave blank to keep current password</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select value={form.role || 'Cashier'} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employee *</label>
                  <select value={form.employee_id || ''} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.employee_name}</option>)}
                  </select>
                </div>
              </div>
              {modal === 'edit' && (
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Create Account' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body">
              <p>Delete account <strong>@{confirmDelete.username}</strong>? This cannot be undone.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>You cannot delete your own account.</p>
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
