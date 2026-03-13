import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    const [sale, items] = await Promise.all([
      sql`
        SELECT s.*, u.username, e.employee_name, c.customer_name, c.contacts as customer_contacts
        FROM sale s
        JOIN users u ON s.user_id = u.user_id
        JOIN employee e ON u.employee_id = e.employee_id
        LEFT JOIN customer c ON s.customer_id = c.customer_id
        WHERE s.sale_id = ${id}
      `,
      sql`
        SELECT sd.*, p.product_name, p.unit
        FROM sales_details sd
        JOIN product p ON sd.product_id = p.product_id
        WHERE sd.sale_id = ${id}
      `
    ])

    if (!sale.length) return NextResponse.json({ error: 'Sale not found' }, { status: 404 })

    return NextResponse.json({ ...sale[0], items })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
