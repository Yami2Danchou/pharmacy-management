'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function ExpirationPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(90)

  useEffect(() => { loadData() }, [days])

  async function loadData() {
    setLoading(true)
    const data = await fetch(`/api/expiration?days=${days}`).then(r => r.json())
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function statusBadge(d) {
    const n = Number(d)
    if (n < 0) return <span className="badge badge-danger">Expired</span>
    if (n <= 7) return <span className="badge badge-danger">Critical ({n}d)</span>
    if (n <= 30) return <span className="badge badge-warning">Warning ({n}d)</span>
    return <span className="badge badge-info">{n} days</span>
  }

  const expired = items.filter(i => Number(i.days_until_expiry) < 0).length
  const critical = items.filter(i => Number(i.days_until_expiry) >= 0 && Number(i.days_until_expiry) <= 7).length
  const warning = items.filter(i => Number(i.days_until_expiry) > 7 && Number(i.days_until_expiry) <= 30).length

  const columns = [
    { key: 'product_name', label: 'Product', render: r => <span className="font-medium">{r.product_name}</span> },
    { key: 'brand_name', label: 'Brand' },
    { key: 'category_name', label: 'Category' },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'quantity', label: 'Qty', style: { textAlign: 'right' } },
    { key: 'expirationdate', label: 'Expiry Date', render: r => new Date(r.expirationdate).toLocaleDateString('en-PH', { dateStyle: 'medium' }) },
    { key: 'days_until_expiry', label: 'Status', render: r => statusBadge(r.days_until_expiry) },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>⏰ Expiration Monitor</h2>
          <p className="text-sm text-muted">Track medicine expiration dates and batch codes</p>
        </div>
      </div>

      {expired > 0 && (
        <div className="alert alert-danger mb-4">
          🚨 <strong>{expired} batch{expired > 1 ? 'es have' : ' has'} already expired.</strong> Remove from inventory immediately using Stock Out → Expired.
        </div>
      )}
      {critical > 0 && (
        <div className="alert alert-warning mb-4">
          ⚠ <strong>{critical} batch{critical > 1 ? 'es expire' : ' expires'} within 7 days.</strong> Take action to sell or return to supplier.
        </div>
      )}

      <div className="stats-grid mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ borderLeft: expired > 0 ? '3px solid var(--danger)' : undefined }}>
          <div className="stat-label">Expired</div>
          <div className="stat-value" style={{ color: expired > 0 ? 'var(--danger)' : undefined }}>{expired}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: critical > 0 ? '3px solid var(--danger)' : undefined }}>
          <div className="stat-label">Critical (≤7 days)</div>
          <div className="stat-value" style={{ color: critical > 0 ? 'var(--danger)' : undefined }}>{critical}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: warning > 0 ? '3px solid var(--warning)' : undefined }}>
          <div className="stat-label">Warning (8–30 days)</div>
          <div className="stat-value" style={{ color: warning > 0 ? 'var(--warning)' : undefined }}>{warning}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Products Expiring Within</span>
          <div className="flex items-center gap-2">
            {[30, 60, 90, 180].map(d => (
              <button key={d} className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => setDays(d)}>{d} days</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <p>No products expiring within {days} days.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={items} searchKeys={['product_name', 'batch_code', 'brand_name']} />
        )}
      </div>
    </div>
  )
}
