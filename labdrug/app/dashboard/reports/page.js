'use client'
import { useState, useEffect } from 'react'

export default function ReportsPage() {
  const [report, setReport] = useState(null)
  const [type, setType] = useState('daily')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadReport() }, [type])

  async function loadReport() {
    setLoading(true)
    const params = new URLSearchParams({ type })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const data = await fetch(`/api/reports?${params}`).then(r => r.json())
    setReport(data.error ? null : data)
    setLoading(false)
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-PH', { dateStyle: 'long' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Reports</h2>
          <p className="text-sm text-muted">Sales, inventory, and operational reports</p>
        </div>
        <button className="btn btn-outline" onClick={() => window.print()}>🖨 Print Report</button>
      </div>

      {/* Controls */}
      <div className="card mb-4">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['daily', 'weekly', 'monthly'].map(t => (
              <button key={t} className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setType(t); setFrom(''); setTo('') }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted">or custom range:</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 'auto' }} />
          <span className="text-sm text-muted">–</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn btn-primary btn-sm" onClick={loadReport}>Generate</button>
        </div>
      </div>

      {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Generating report...</div>}

      {!loading && report && (
        <>
          <div className="alert alert-info mb-4">
            📅 Report Period: <strong>{formatDate(report.period.from)}</strong> — <strong>{formatDate(report.period.to)}</strong>
          </div>

          {/* Sales Summary */}
          <div className="stats-grid mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                ₱{Number(report.sales.total_revenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{report.sales.transaction_count}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg. per Transaction</div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                ₱{Number(report.sales.avg_transaction).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Top Products */}
            <div className="card">
              <div className="card-header"><span className="card-title">Top 10 Products by Sales</span></div>
              {report.topProducts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>No sales in this period.</div>
              ) : (
                <table>
                  <thead><tr><th>Product</th><th style={{ textAlign: 'right' }}>Qty Sold</th><th style={{ textAlign: 'right' }}>Revenue</th></tr></thead>
                  <tbody>
                    {report.topProducts.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{i + 1}</span>
                            {p.product_name}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>{p.qty_sold}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₱{Number(p.revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Daily Breakdown */}
            <div className="card">
              <div className="card-header"><span className="card-title">Daily Sales Breakdown</span></div>
              {report.salesByDay.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>No sales in this period.</div>
              ) : (
                <table>
                  <thead><tr><th>Date</th><th style={{ textAlign: 'center' }}>Transactions</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                  <tbody>
                    {report.salesByDay.map((d, i) => (
                      <tr key={i}>
                        <td>{new Date(d.sale_date).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                        <td style={{ textAlign: 'center' }}>{d.count}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₱{Number(d.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Inventory Snapshot */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">📦 Inventory Snapshot</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div className="stat-card">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value">{report.inventory.total_products}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">In Stock</div>
                  <div className="stat-value" style={{ color: 'var(--accent)' }}>{report.inventory.in_stock}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Low Stock</div>
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>{report.inventory.low_stock}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Out of Stock</div>
                  <div className="stat-value" style={{ color: 'var(--danger)' }}>{report.inventory.out_of_stock}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Out Summary */}
          <div className="card">
            <div className="card-header"><span className="card-title">📤 Stock Out Events (same period)</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="stat-card">
                  <div className="stat-label">Events Recorded</div>
                  <div className="stat-value">{report.stockOuts.count}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Est. Loss Value</div>
                  <div className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--danger)' }}>
                    ₱{Number(report.stockOuts.total_loss).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
