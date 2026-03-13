'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSalePage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [rxNote, setRxNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [amountGiven, setAmountGiven] = useState('')
  const searchRef = useRef()

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []))
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []))
  }, [])

  const filtered = products.filter(p =>
    search.length >= 2 &&
    (p.product_name.toLowerCase().includes(search.toLowerCase()) ||
     p.brand_name?.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredCustomers = customers.filter(c =>
    customerSearch.length >= 2 &&
    c.customer_name?.toLowerCase().includes(customerSearch.toLowerCase())
  )

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.product_id)
      if (existing) {
        return prev.map(i => i.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, {
        product_id: product.product_id,
        product_name: product.product_name,
        unit: product.unit,
        unit_price: Number(product.price),
        quantity: 1,
        max_stock: Number(product.current_stock),
      }]
    })
    setSearch('')
    searchRef.current?.focus()
  }

  function updateQty(productId, qty) {
    const num = parseInt(qty) || 1
    setCart(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: Math.max(1, num) } : i))
  }

  function removeItem(productId) {
    setCart(prev => prev.filter(i => i.product_id !== productId))
  }

  const total = cart.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const change = Number(amountGiven) - total

  async function handleSubmit() {
    if (cart.length === 0) { setError('Add at least one item to the sale.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer?.customer_id || null,
          sale_description: rxNote || null,
          items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save sale'); setSubmitting(false); return }
      setSuccess(`Sale #${data.sale_id} recorded successfully!`)
      setCart([])
      setSelectedCustomer(null)
      setRxNote('')
      setAmountGiven('')
      setTimeout(() => setSuccess(''), 4000)
    } catch { setError('Network error') }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>New Sale</h2>
          <p className="text-sm text-muted">Process a sales transaction</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.push('/dashboard/sales')}>← Back to Sales</button>
      </div>

      {error && <div className="alert alert-danger mb-4">⚠ {error}</div>}
      {success && <div className="alert alert-success mb-4">✓ {success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left: Product search + cart */}
        <div>
          {/* Product Search */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">🔍 Search Products</span></div>
            <div className="card-body">
              <input
                ref={searchRef}
                type="text"
                placeholder="Type product name or brand (min. 2 chars)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              {filtered.length > 0 && (
                <div style={{ marginTop: '0.75rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
                  {filtered.map(p => (
                    <div key={p.product_id}
                      onClick={() => addToCart(p)}
                      style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <div>
                        <div className="font-medium" style={{ fontSize: '0.875rem' }}>{p.product_name}</div>
                        <div className="text-sm text-muted">{p.brand_name} · {p.unit} · Stock: {p.current_stock}</div>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>₱{Number(p.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
              {search.length >= 2 && filtered.length === 0 && (
                <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>No products found for "{search}"</p>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🛒 Items ({cart.length})</span>
              {cart.length > 0 && <button className="btn btn-outline btn-sm" onClick={() => setCart([])} style={{ color: 'var(--danger)' }}>Clear All</button>}
            </div>
            {cart.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--gray-300)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                <p>Search and add products above</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'center', width: 100 }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.product_id}>
                      <td>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted">{item.unit}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateQty(item.product_id, e.target.value)}
                          style={{ width: 70, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>₱{item.unit_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₱{(item.quantity * item.unit_price).toFixed(2)}</td>
                      <td>
                        <button onClick={() => removeItem(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '1rem' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', paddingTop: '0.875rem' }}>TOTAL</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)', paddingTop: '0.875rem' }}>₱{total.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Right: Customer + payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer */}
          <div className="card">
            <div className="card-header"><span className="card-title">👤 Customer</span></div>
            <div className="card-body">
              {selectedCustomer ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="font-medium">{selectedCustomer.customer_name}</div>
                    <div className="text-sm text-muted">{selectedCustomer.contacts}</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedCustomer(null)}>Change</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search customer name..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  {filteredCustomers.length > 0 && (
                    <div style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                      {filteredCustomers.slice(0, 5).map(c => (
                        <div key={c.customer_id}
                          onClick={() => { setSelectedCustomer(c); setCustomerSearch('') }}
                          style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          {c.customer_name} <span className="text-muted">· {c.contacts}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Leave empty for walk-in</p>
                </>
              )}
            </div>
          </div>

          {/* Rx Note */}
          <div className="card">
            <div className="card-header"><span className="card-title">📋 Rx / Note</span></div>
            <div className="card-body">
              <textarea rows={2} placeholder="Prescription note (optional)..." value={rxNote} onChange={e => setRxNote(e.target.value)} />
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <div className="card-header"><span className="card-title">💵 Payment</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₱{total.toFixed(2)}</span>
              </div>
              <div className="form-group">
                <label className="form-label">Amount Given (₱)</label>
                <input type="number" step="0.01" min="0" value={amountGiven} onChange={e => setAmountGiven(e.target.value)} placeholder="0.00" style={{ fontSize: '1.1rem', fontWeight: 600 }} />
              </div>
              {Number(amountGiven) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px dashed var(--gray-200)', marginTop: '0.5rem' }}>
                  <span className="font-medium">Change</span>
                  <span className={`font-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {change >= 0 ? `₱${change.toFixed(2)}` : `⚠ Short ₱${Math.abs(change).toFixed(2)}`}
                  </span>
                </div>
              )}

              {/* Quick cash buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                {[20, 50, 100, 200, 500, 1000].map(amt => (
                  <button key={amt} className="btn btn-outline btn-sm" onClick={() => setAmountGiven(String(amt))}>₱{amt}</button>
                ))}
              </div>
              <button
                className="btn btn-primary w-full"
                style={{ marginTop: '1rem', padding: '0.75rem', justifyContent: 'center', fontSize: '1rem' }}
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
              >
                {submitting ? 'Processing...' : '✓ Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
