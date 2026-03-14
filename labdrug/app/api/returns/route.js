import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const returns = await sql`
      SELECT r.return_product_id, r.return_date, r.return_type, r.reason,
        r.customer_name, r.sale_id, u.username,
        e.employee_name as verified_by, COUNT(rd.return_details_id) as item_count
      FROM return_of_products r
      JOIN users u ON r.user_id = u.user_id
      JOIN employee e ON r.verified_by_employee_id = e.employee_id
      LEFT JOIN return_details rd ON r.return_product_id = rd.return_id
      GROUP BY r.return_product_id, u.username, e.employee_name
      ORDER BY r.return_product_id DESC LIMIT 100
    `
    return NextResponse.json(returns)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { return_type, reason, verified_by_employee_id, sale_id, customer_name, items } = await request.json()
    const returnResult = await sql`
      INSERT INTO return_of_products (return_date, return_type, reason, verified_by_employee_id, sale_id, customer_name, user_id)
      VALUES (CURRENT_DATE, ${return_type}, ${reason}, ${verified_by_employee_id}, ${sale_id || null}, ${customer_name || null}, ${session.userId})
      RETURNING return_product_id
    `
    const returnId = returnResult[0].return_product_id

    for (const item of items) {
      await sql`
        INSERT INTO return_details (return_id, product_id, quantity)
        VALUES (${returnId}, ${item.product_id}, ${item.quantity})
      `
      if (return_type === 'Resellable') {
        const batch = await sql`
          SELECT batch_code FROM product_expirationdate
          WHERE product_id = ${item.product_id}
          ORDER BY expirationdate DESC NULLS LAST LIMIT 1
        `
        if (batch.length > 0) {
          await sql`
            UPDATE product_expirationdate SET quantity = quantity + ${item.quantity}
            WHERE batch_code = ${batch[0].batch_code} AND product_id = ${item.product_id}
          `
        }
      }
    }
    return NextResponse.json({ success: true, return_id: returnId }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
