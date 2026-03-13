'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadInventory() }, [])

  async function loadInventory() {
    setLoading(true)
    const data = await fetch('/api/inventory').then(r => r.json())
    setInventory(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const filtered = inventory.filter(p => {
    const stock = Number(p.current_stock)
    if (filter === 'out') return stock === 0
    if (filter === 'low') return stock > 0 && stock <= Number(p.reorder_level)
    if (filter === 'ok') return stock > Number(p.reorder_level)
    return true
  })

  const outCount = inventory.filter(p => Number(p.current_stock) === 0).length
  const lowCount = inventory.filter(p => Number(p.current_stock) > 0 && Number(p.current_stock) <= Number(p.reorder_level)).length
  const okCount = inventory.filter(p => Number(p.current_stock) > Number(p.reorder_level)).length

  const columns = [
    { key: 'product_name', label: 'Product', render: r => <span className="font-medium">{r.product_name}</span> },
    { key: 'brand_name', label: 'Brand' },
    { key: 'category_name', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'price', label: 'Price', style: { textAlign: 'right' }, render: r => `₱${Number(r.price).toFixed(2)}` },
    { key: 'current_stock', label: 'Stock', style: { textAlign: 'right' }, render: r => {
      const stock = Number(r.current_stock)
      const reorder = Number(r.reorder_level)
      if (stock === 0) return <span className="badge badge-danger">Out of Stock</span>
      if (stock <= reorder) return <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{stock} <span className="badge badge-warning" style={{ marginLeft: 4 }}>Low</span></span>
      return <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{stock}</span>
    }},
    { key: 'reorder_level', label: 'Reorder At', style: { textAlign: 'right' } },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Inventory</h2>
          <p className="text-sm text-muted">Current stock levels across all products</p>
        </div>
        <button className="btn btn-outline" onClick={loadInventory}>↻ Refresh</button>
      </div>

      <div className="stats-grid mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: filter === 'all' ? '3px solid var(--primary)' : undefined }} onClick={() => setFilter('all')}>
          <div className="stat-label">All Products</div>
          <div className="stat-value">{inventory.length}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: filter === 'ok' ? '3px solid var(--accent)' : undefined }} onClick={() => setFilter('ok')}>
          <div className="stat-label">In Stock</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{okCount}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: filter === 'low' ? '3px solid var(--warning)' : undefined }} onClick={() => setFilter('low')}>
          <div className="stat-label">Low Stock</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{lowCount}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: filter === 'out' ? '3px solid var(--danger)' : undefined }} onClick={() => setFilter('out')}>
          <div className="stat-label">Out of Stock</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{outCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {filter === 'all' ? 'All Products' : filter === 'out' ? 'Out of Stock' : filter === 'low' ? 'Low Stock' : 'In Stock'}
            <span className="badge badge-gray" style={{ marginLeft: 8 }}>{filtered.length}</span>
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'ok', 'low', 'out'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'ok' ? 'In Stock' : f === 'low' ? 'Low' : 'Out'}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading inventory...</div>
        ) : (
          <DataTable columns={columns} data={filtered} searchKeys={['product_name', 'brand_name', 'category_name']} />
        )}
      </div>
    </div>
  )
}
