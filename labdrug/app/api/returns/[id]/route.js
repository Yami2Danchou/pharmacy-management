import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await sql`DELETE FROM return_details WHERE return_id = ${id}`
    const result = await sql`DELETE FROM return_of_products WHERE return_product_id = ${id} RETURNING return_product_id`
    if (!result.length) return NextResponse.json({ error: 'Return record not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: `Delete failed: ${err.message}` }, { status: 500 })
  }
}
