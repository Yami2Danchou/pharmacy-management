import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const inventory = await sql`SELECT * FROM inventory_view ORDER BY product_name`
    return NextResponse.json(inventory)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
