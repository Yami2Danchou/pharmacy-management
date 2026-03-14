import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rows = await sql`SELECT * FROM category ORDER BY category_name`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role === 'Cashier') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { category_name, description } = await request.json()
    const result = await sql`INSERT INTO category (category_name, description) VALUES (${category_name}, ${description}) RETURNING *`
    return NextResponse.json(result[0], { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
