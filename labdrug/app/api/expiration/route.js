import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '90')

  try {
    const expiring = await sql`
      SELECT p.product_id, p.product_name, p.unit,
        pe.batch_code, pe.quantity, pe.expirationdate,
        (pe.expirationdate - CURRENT_DATE) AS days_until_expiry,
        c.category_name, b.brand_name
      FROM product_expirationdate pe
      JOIN product p ON pe.product_id = p.product_id
      JOIN category c ON p.category_id = c.category_id
      JOIN brand b ON p.brand_id = b.brand_id
      WHERE pe.expirationdate IS NOT NULL
        AND pe.expirationdate <= CURRENT_DATE + (${days} || ' days')::interval
        AND pe.quantity > 0
      ORDER BY pe.expirationdate ASC
    `
    return NextResponse.json(expiring)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
