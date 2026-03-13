'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadSales()
  }, [])

  async function loadSales() {
    setLoading(true)
    const params = new URLSearchParams()
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    params.set('limit', '200')
    const data = await fetch(`/api/sales?${params}`).then(r => r.json())
    setSales(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function viewSale(sale) {
    const data = await fetch(`/api/sales/${sale.sale_id}`).then(r => r.json())
    setSelected(data)
  }

  const totalRevenue = sales.reduce((s, r) => s + Number(r.total_amount || 0), 0)

  const columns = [
    { key: 'sale_id', label: 'Sale #', render: r => <span className="font-medium">#{r.sale_id}</span> },
    { key: 'sale_date', label: 'Date', render: r => new Date(r.sale_date).toLocaleDateString('en-PH') },
    { key: 'customer_name', label: 'Customer', render: r => r.customer_name || <span className="text-muted">Walk-in</span> },
    { key: 'item_count', label: 'Items', style: { textAlign: 'center' } },
    { key: 'username', label: 'Cashier' },
    { key: 'total_amount', label: 'Total', style: { textAlign: 'right', fontWeight: 600 }, render: r => `₱${Number(r.total_amount).toFixed(2)}` },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Sales Transactions</h2>
          <p className="text-sm text-muted">View and manage all sales</p>
        </div>
        <Link href="/dashboard/sales/new" className="btn btn-primary">+ New Sale</Link>
      </div>

      <div className="stats-grid mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{sales.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ fontSize: '1.3rem' }}>₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Sale</div>
          <div className="stat-value" style={{ fontSize: '1.3rem' }}>₱{sales.length ? (totalRevenue / sales.length).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Sales Records</span>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 'auto' }} />
            <span className="text-sm text-muted">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 'auto' }} />
            <button className="btn btn-outline btn-sm" onClick={loadSales}>Filter</button>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            data={sales}
            searchKeys={['customer_name', 'username']}
            actions={row => (
              <button className="btn btn-outline btn-sm" onClick={() => viewSale(row)}>View</button>
            )}
          />
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <span className="modal-title">Sale Receipt — #{selected.sale_id}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div><span className="form-label">Date</span><div>{new Date(selected.sale_date).toLocaleDateString('en-PH', { dateStyle: 'long' })}</div></div>
                <div><span className="form-label">Customer</span><div>{selected.customer_name || 'Walk-in'}</div></div>
                <div><span className="form-label">Cashier</span><div>{selected.username}</div></div>
              </div>
              {selected.sale_description && (
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>📋 Rx Note: {selected.sale_description}</div>
              )}
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.items || []).map(item => (
                    <tr key={item.sales_detail_id}>
                      <td>{item.product_name}</td>
                      <td className="text-muted">{item.unit}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₱{Number(item.unit_price).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₱{Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, paddingTop: '0.75rem' }}>TOTAL</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', paddingTop: '0.75rem' }}>₱{Number(selected.total_amount).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => window.print()}>🖨 Print</button>
              <button className="btn btn-primary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
