import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const supplies = await sql`
      SELECT su.supply_id, su.supply_date, su.total_amount,
        sp.supplier_name, u.username, COUNT(sd.product_id) as item_count
      FROM supply su
      JOIN supplier sp ON su.supplier_id = sp.supplier_id
      JOIN users u ON su.user_id = u.user_id
      LEFT JOIN supply_details sd ON su.supply_id = sd.supply_id
      GROUP BY su.supply_id, sp.supplier_name, u.username
      ORDER BY su.supply_id DESC LIMIT 100
    `
    return NextResponse.json(supplies)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role === 'Cashier') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { supplier_id, employee_id, items } = await request.json()
    if (!items || items.length === 0) return NextResponse.json({ error: 'No items in supply' }, { status: 400 })

    const total = items.reduce((sum, item) => sum + (item.quantity * item.supply_amount), 0)
    const supplyResult = await sql`
      INSERT INTO supply (supply_date, supplier_id, employee_id, user_id, total_amount)
      VALUES (CURRENT_DATE, ${supplier_id}, ${employee_id || null}, ${session.userId}, ${total})
      RETURNING supply_id
    `
    const supplyId = supplyResult[0].supply_id

    for (const item of items) {
      const subtotal = item.quantity * item.supply_amount
      await sql`
        INSERT INTO supply_details (supply_id, product_id, quantity, supply_amount, subtotal)
        VALUES (${supplyId}, ${item.product_id}, ${item.quantity}, ${item.supply_amount}, ${subtotal})
      `
      const existing = await sql`
        SELECT 1 FROM product_expirationdate
        WHERE batch_code = ${item.batch_code} AND product_id = ${item.product_id}
      `
      if (existing.length > 0) {
        await sql`
          UPDATE product_expirationdate SET quantity = quantity + ${item.quantity}
          WHERE batch_code = ${item.batch_code} AND product_id = ${item.product_id}
        `
      } else {
        await sql`
          INSERT INTO product_expirationdate (batch_code, product_id, quantity, expirationdate)
          VALUES (${item.batch_code}, ${item.product_id}, ${item.quantity}, ${item.expirationdate || null})
        `
      }
    }
    return NextResponse.json({ success: true, supply_id: supplyId }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
