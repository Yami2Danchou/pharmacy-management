import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  try {
    const rows = await sql`
      SELECT * FROM customer
      WHERE customer_name ILIKE ${'%' + search + '%'}
      ORDER BY customer_name
      LIMIT 50
    `
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { customer_name, birth_date, gender, contacts, address } = await request.json()
    const result = await sql`
      INSERT INTO customer (customer_name, birth_date, gender, contacts, address)
      VALUES (${customer_name}, ${birth_date || null}, ${gender}, ${contacts}, ${address})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
