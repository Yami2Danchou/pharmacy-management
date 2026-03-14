import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const [supply, items] = await Promise.all([
      sql`
        SELECT su.*, sp.supplier_name, u.username, e.employee_name
        FROM supply su
        JOIN supplier sp ON su.supplier_id = sp.supplier_id
        JOIN users u ON su.user_id = u.user_id
        LEFT JOIN employee e ON su.employee_id = e.employee_id
        WHERE su.supply_id = ${id}
      `,
      sql`
        SELECT sd.*, p.product_name, p.unit
        FROM supply_details sd
        JOIN product p ON sd.product_id = p.product_id
        WHERE sd.supply_id = ${id}
      `
    ])
    if (!supply.length) return NextResponse.json({ error: 'Supply record not found' }, { status: 404 })
    return NextResponse.json({ ...supply[0], items })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await sql`DELETE FROM supply_details WHERE supply_id = ${id}`
    const result = await sql`DELETE FROM supply WHERE supply_id = ${id} RETURNING supply_id`
    if (!result.length) return NextResponse.json({ error: 'Supply record not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: `Delete failed: ${err.message}` }, { status: 500 })
  }
}
