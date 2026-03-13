'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/supplies').then(r => r.json()).then(d => {
      setSupplies(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

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
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Supply Deliveries</h2>
          <p className="text-sm text-muted">Manage incoming stock from suppliers</p>
        </div>
        <Link href="/dashboard/supplies/new" className="btn btn-primary">+ Record Delivery</Link>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
        ) : (
          <DataTable columns={columns} data={supplies} searchKeys={['supplier_name', 'username']} />
        )}
      </div>
    </div>
  )
}
