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
    await sql`DELETE FROM customer WHERE customer_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
