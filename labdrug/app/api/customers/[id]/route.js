import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(request, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const { customer_name, birth_date, gender, contacts, address } = await request.json()
    const result = await sql`
      UPDATE customer SET
        customer_name = ${customer_name},
        birth_date = ${birth_date || null},
        gender = ${gender},
        contacts = ${contacts},
        address = ${address}
      WHERE customer_id = ${id}
      RETURNING *
    `
    if (!result.length) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
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
    const [inSales, inReturns] = await Promise.all([
      sql`SELECT COUNT(*) as c FROM sale WHERE customer_id = ${id}`,
      sql`SELECT COUNT(*) as c FROM return_of_products WHERE customer_name IS NOT NULL AND sale_id IN (SELECT sale_id FROM sale WHERE customer_id = ${id})`,
    ])

    const reasons = []
    if (Number(inSales[0].c) > 0) reasons.push(`${inSales[0].c} sales transaction(s)`)

    if (reasons.length > 0) {
      return NextResponse.json({
        error: `Cannot delete this customer because they are linked to: ${reasons.join(', ')}. You can edit their record instead.`
      }, { status: 400 })
    }

    await sql`DELETE FROM customer WHERE customer_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Cannot delete this customer. They have linked sales transaction records." }, { status: 400 })
  }
}
