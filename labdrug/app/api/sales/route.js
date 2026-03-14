import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = parseInt(searchParams.get('limit') || '200')
  try {
    let sales
    if (from && to) {
      sales = await sql`
        SELECT s.sale_id, s.sale_date, s.total_amount, s.sale_description,
          u.username, c.customer_name, COUNT(sd.sales_detail_id) as item_count
        FROM sale s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN customer c ON s.customer_id = c.customer_id
        LEFT JOIN sales_details sd ON s.sale_id = sd.sale_id
        WHERE s.sale_date BETWEEN ${from} AND ${to}
        GROUP BY s.sale_id, u.username, c.customer_name
        ORDER BY s.sale_id DESC LIMIT ${limit}
      `
    } else {
      sales = await sql`
        SELECT s.sale_id, s.sale_date, s.total_amount, s.sale_description,
          u.username, c.customer_name, COUNT(sd.sales_detail_id) as item_count
        FROM sale s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN customer c ON s.customer_id = c.customer_id
        LEFT JOIN sales_details sd ON s.sale_id = sd.sale_id
        GROUP BY s.sale_id, u.username, c.customer_name
        ORDER BY s.sale_id DESC LIMIT ${limit}
      `
    }
    return NextResponse.json(sales)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { customer_id, sale_description, items } = await request.json()
    if (!items || items.length === 0) return NextResponse.json({ error: 'No items in sale' }, { status: 400 })

    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const saleResult = await sql`
      INSERT INTO sale (sale_date, customer_id, sale_description, total_amount, user_id)
      VALUES (CURRENT_DATE, ${customer_id || null}, ${sale_description || null}, ${total}, ${session.userId})
      RETURNING sale_id
    `
    const saleId = saleResult[0].sale_id

    for (const item of items) {
      await sql`
        INSERT INTO sales_details (sale_id, product_id, quantity, unit_price)
        VALUES (${saleId}, ${item.product_id}, ${item.quantity}, ${item.unit_price})
      `
      let remaining = item.quantity
      const batches = await sql`
        SELECT batch_code, product_id, quantity FROM product_expirationdate
        WHERE product_id = ${item.product_id} AND quantity > 0
        ORDER BY expirationdate ASC NULLS LAST
      `
      for (const batch of batches) {
        if (remaining <= 0) break
        const deduct = Math.min(remaining, batch.quantity)
        await sql`
          UPDATE product_expirationdate SET quantity = quantity - ${deduct}
          WHERE batch_code = ${batch.batch_code} AND product_id = ${batch.product_id}
        `
        remaining -= deduct
      }
    }
    return NextResponse.json({ success: true, sale_id: saleId }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
