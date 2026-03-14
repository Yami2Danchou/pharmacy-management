import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(request, { params }) {
  const session = await getSession()
  if (!session || session.role === 'Cashier') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const { supplier_name, contact_person, contact_number, address } = await request.json()
    const result = await sql`
      UPDATE supplier SET
        supplier_name = ${supplier_name},
        contact_person = ${contact_person},
        contact_number = ${contact_number},
        address = ${address}
      WHERE supplier_id = ${id}
      RETURNING *
    `
    if (!result.length) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    return NextResponse.json(result[0])
  } catch (err) {
    if (err.message.includes('unique')) return NextResponse.json({ error: 'A supplier with that name already exists.' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const linked = await sql`SELECT COUNT(*) as c FROM supply WHERE supplier_id = ${id}`
    if (Number(linked[0].c) > 0) {
      return NextResponse.json({
        error: `Cannot delete this supplier because it is linked to ${linked[0].c} supply delivery record(s). Delete those deliveries first.`
      }, { status: 400 })
    }
    await sql`DELETE FROM supplier WHERE supplier_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Cannot delete this supplier. They have linked supply delivery records. Delete those deliveries first." }, { status: 400 })
  }
}
