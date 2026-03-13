import sql from '@/lib/db'
import Link from 'next/link'

async function getDashboardData() {
  try {
    const [salesToday, totalProducts, lowStock, expiring, recentSales] = await Promise.all([
      sql`SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count FROM sale WHERE sale_date = CURRENT_DATE`,
      sql`SELECT COUNT(*) as count FROM product`,
      sql`SELECT COUNT(*) as count FROM inventory_view WHERE current_stock <= reorder_level AND current_stock > 0`,
      sql`SELECT COUNT(*) as count FROM expiring_products_view WHERE days_until_expiry <= 30`,
      sql`
        SELECT s.sale_id, s.sale_date, s.total_amount, u.username, c.customer_name
        FROM sale s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN customer c ON s.customer_id = c.customer_id
        ORDER BY s.sale_id DESC LIMIT 5
      `,
    ])
    return {
      salesToday: salesToday[0],
      totalProducts: totalProducts[0].count,
      lowStock: lowStock[0].count,
      expiring: expiring[0].count,
      recentSales,
    }
  } catch {
    return {
      salesToday: { total: 0, count: 0 },
      totalProducts: 0,
      lowStock: 0,
      expiring: 0,
      recentSales: [],
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.25rem' }}>Good day! 👋</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Here's what's happening at Labdrug Pharmacy today.</p>
      </div>

      {/* Alerts */}
      {Number(data.expiring) > 0 && (
        <div className="alert alert-warning mb-4">
          ⏰ <strong>{data.expiring} product batch{Number(data.expiring) > 1 ? 'es' : ''}</strong> expiring within 30 days.
          <Link href="/dashboard/expiration" style={{ marginLeft: '0.5rem', fontWeight: 600, color: 'inherit', textDecoration: 'underline' }}>View now →</Link>
        </div>
      )}
      {Number(data.lowStock) > 0 && (
        <div className="alert alert-danger mb-4">
          📦 <strong>{data.lowStock} product{Number(data.lowStock) > 1 ? 's' : ''}</strong> at or below reorder level.
          <Link href="/dashboard/inventory" style={{ marginLeft: '0.5rem', fontWeight: 600, color: 'inherit', textDecoration: 'underline' }}>Check inventory →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Sales Today</div>
          <div className="stat-value">₱{Number(data.salesToday.total).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-hint">{data.salesToday.count} transaction{data.salesToday.count !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{data.totalProducts}</div>
          <div className="stat-hint">in system</div>
        </div>
        <div className="stat-card" style={{ borderLeft: Number(data.lowStock) > 0 ? '3px solid var(--danger)' : undefined }}>
          <div className="stat-icon">📦</div>
          <div className="stat-label">Low Stock</div>
          <div className="stat-value" style={{ color: Number(data.lowStock) > 0 ? 'var(--danger)' : undefined }}>{data.lowStock}</div>
          <div className="stat-hint">need restocking</div>
        </div>
        <div className="stat-card" style={{ borderLeft: Number(data.expiring) > 0 ? '3px solid var(--warning)' : undefined }}>
          <div className="stat-icon">⏰</div>
          <div className="stat-label">Expiring Soon</div>
          <div className="stat-value" style={{ color: Number(data.expiring) > 0 ? 'var(--warning)' : undefined }}>{data.expiring}</div>
          <div className="stat-hint">within 30 days</div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Sales</span>
          <Link href="/dashboard/sales" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-container">
          {data.recentSales.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              No sales recorded yet today.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sale #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Cashier</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map(s => (
                  <tr key={s.sale_id}>
                    <td><span className="font-medium">#{s.sale_id}</span></td>
                    <td>{new Date(s.sale_date).toLocaleDateString('en-PH')}</td>
                    <td>{s.customer_name || <span className="text-muted">Walk-in</span>}</td>
                    <td>{s.username}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₱{Number(s.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid-3 mt-4" style={{ marginTop: '1rem' }}>
        <Link href="/dashboard/sales/new">
          <div className="card" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>🛒</div>
            <div>
              <div className="font-medium">New Sale</div>
              <div className="text-sm text-muted">Process a transaction</div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/supplies/new">
          <div className="card" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>🚚</div>
            <div>
              <div className="font-medium">Record Delivery</div>
              <div className="text-sm text-muted">Add stock from supplier</div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/reports">
          <div className="card" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>📋</div>
            <div>
              <div className="font-medium">Generate Report</div>
              <div className="text-sm text-muted">Sales & inventory</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
