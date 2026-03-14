import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const rows = await sql`
      SELECT p.*, c.category_name, b.brand_name,
        COALESCE(SUM(pe.quantity), 0) AS current_stock
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN brand b ON p.brand_id = b.brand_id
      LEFT JOIN product_expirationdate pe ON p.product_id = pe.product_id
      WHERE p.product_id = ${id}
      GROUP BY p.product_id, c.category_name, b.brand_name
    `
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const session = await getSession()
  if (!session || session.role === 'Cashier') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const { product_name, unit, price, category_id, description, brand_id, reorder_level } = await request.json()
    const result = await sql`
      UPDATE product SET
        product_name = ${product_name}, unit = ${unit}, price = ${price},
        category_id = ${category_id}, description = ${description},
        brand_id = ${brand_id}, reorder_level = ${reorder_level}
      WHERE product_id = ${id} RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await sql`DELETE FROM product_expirationdate WHERE product_id = ${id}`
    await sql`DELETE FROM product WHERE product_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
