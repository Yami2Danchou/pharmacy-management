'use client'
import { useState } from 'react'

export default function DataTable({ columns, data, searchKeys = [], actions }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const filtered = data.filter(row => {
    if (!search) return true
    return searchKeys.some(key =>
      String(row[key] || '').toLowerCase().includes(search.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="filter-bar">
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ maxWidth: 280 }}
          />
          <span className="text-sm text-muted">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={col.style}>{col.label}</th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                  No records found.
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} style={col.style}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--gray-100)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  )
}
