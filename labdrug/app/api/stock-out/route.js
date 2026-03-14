import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const stockOuts = await sql`
      SELECT so.stock_out_id, so.stock_out_date, so.total,
        u.username, e.employee_name, COUNT(sod.product_id) as item_count
      FROM stock_out so
      JOIN users u ON so.user_id = u.user_id
      LEFT JOIN employee e ON so.employee_id = e.employee_id
      LEFT JOIN stock_out_details sod ON so.stock_out_id = sod.stock_out_id
      GROUP BY so.stock_out_id, u.username, e.employee_name
      ORDER BY so.stock_out_id DESC LIMIT 100
    `
    return NextResponse.json(stockOuts)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role === 'Cashier') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { employee_id, items } = await request.json()
    if (!items || items.length === 0) return NextResponse.json({ error: 'No items specified' }, { status: 400 })

    const soResult = await sql`
      INSERT INTO stock_out (stock_out_date, employee_id, user_id, total)
      VALUES (CURRENT_DATE, ${employee_id || null}, ${session.userId}, 0)
      RETURNING stock_out_id
    `
    const soId = soResult[0].stock_out_id

    for (const item of items) {
      await sql`
        INSERT INTO stock_out_details (stock_out_id, product_id, quantity, description)
        VALUES (${soId}, ${item.product_id}, ${item.quantity}, ${item.description})
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
    return NextResponse.json({ success: true, stock_out_id: soId }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
