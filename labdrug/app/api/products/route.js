import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category')
  try {
    let products
    if (categoryId) {
      products = await sql`
        SELECT p.*, c.category_name, b.brand_name,
          COALESCE(SUM(pe.quantity), 0) AS current_stock
        FROM product p
        LEFT JOIN category c ON p.category_id = c.category_id
        LEFT JOIN brand b ON p.brand_id = b.brand_id
        LEFT JOIN product_expirationdate pe ON p.product_id = pe.product_id
        WHERE p.category_id = ${categoryId}
          AND (p.product_name ILIKE ${'%' + search + '%'} OR b.brand_name ILIKE ${'%' + search + '%'})
        GROUP BY p.product_id, c.category_name, b.brand_name
        ORDER BY p.product_name
      `
    } else {
      products = await sql`
        SELECT p.*, c.category_name, b.brand_name,
          COALESCE(SUM(pe.quantity), 0) AS current_stock
        FROM product p
        LEFT JOIN category c ON p.category_id = c.category_id
        LEFT JOIN brand b ON p.brand_id = b.brand_id
        LEFT JOIN product_expirationdate pe ON p.product_id = pe.product_id
        WHERE p.product_name ILIKE ${'%' + search + '%'} OR b.brand_name ILIKE ${'%' + search + '%'}
        GROUP BY p.product_id, c.category_name, b.brand_name
        ORDER BY p.product_name
      `
    }
    return NextResponse.json(products)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role === 'Cashier') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { product_name, unit, price, category_id, description, brand_id, reorder_level } = await request.json()
    const result = await sql`
      INSERT INTO product (product_name, unit, price, category_id, description, brand_id, reorder_level)
      VALUES (${product_name}, ${unit}, ${price}, ${category_id}, ${description}, ${brand_id}, ${reorder_level})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
