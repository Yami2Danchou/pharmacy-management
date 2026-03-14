'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModal, setViewModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const d = await fetch('/api/supplies').then(r => r.json())
    setSupplies(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function viewSupply(row) {
    const d = await fetch(`/api/supplies/${row.supply_id}`).then(r => r.json())
    setViewModal(d)
  }

  async function handleDelete() {
    const res = await fetch(`/api/supplies/${confirmDelete.supply_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Delete failed.'); setConfirmDelete(null); return }
    setConfirmDelete(null); load()
  }

  const columns = [
    { key: 'supply_id', label: 'Supply #', render: r => <span className="font-medium">#{r.supply_id}</span> },
    { key: 'supply_date', label: 'Date', render: r => new Date(r.supply_date).toLocaleDateString('en-PH') },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'item_count', label: 'Products', style: { textAlign: 'center' } },
    { key: 'username', label: 'Recorded By' },
    { key: 'total_amount', label: 'Total Cost', style: { textAlign: 'right', fontWeight: 600 }, render: r => `₱${Number(r.total_amount).toFixed(2)}` },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Supply Deliveries</h2><p className="text-sm text-muted">Manage incoming stock from suppliers</p></div>
        <Link href="/dashboard/supplies/new" className="btn btn-primary">+ Record Delivery</Link>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div> : (
          <DataTable columns={columns} data={supplies} searchKeys={['supplier_name', 'username']}
            actions={row => (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => viewSupply(row)}>View</button>
                <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fca5a5' }} onClick={() => setConfirmDelete(row)}>Delete</button>
              </div>
            )}
          />
        )}
      </div>

      {/* View Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <span className="modal-title">Supply Delivery — #{viewModal.supply_id}</span>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div><span className="form-label">Date</span><div>{new Date(viewModal.supply_date).toLocaleDateString('en-PH', { dateStyle: 'long' })}</div></div>
                <div><span className="form-label">Supplier</span><div>{viewModal.supplier_name}</div></div>
                <div><span className="form-label">Recorded By</span><div>{viewModal.username}</div></div>
              </div>
              <table>
                <thead><tr><th>Product</th><th>Unit</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Cost</th><th style={{ textAlign: 'right' }}>Subtotal</th></tr></thead>
                <tbody>
                  {(viewModal.items || []).map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name}</td>
                      <td className="text-muted">{item.unit}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₱{Number(item.supply_amount).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₱{Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, paddingTop: '0.75rem' }}>TOTAL</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', paddingTop: '0.75rem' }}>₱{Number(viewModal.total_amount).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body">
              <p>Delete supply delivery <strong>#{confirmDelete.supply_id}</strong> from <strong>{confirmDelete.supplier_name}</strong>?</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>This cannot be undone. Note: inventory quantities will NOT be automatically reversed.</p>
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
