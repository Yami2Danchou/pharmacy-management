import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rows = await sql`SELECT * FROM employee ORDER BY employee_name`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { employee_name, employee_gender, employee_age, employee_address, employee_contacts } = await request.json()
    const result = await sql`
      INSERT INTO employee (employee_name, employee_gender, employee_age, employee_address, employee_contacts)
      VALUES (${employee_name}, ${employee_gender}, ${employee_age}, ${employee_address}, ${employee_contacts})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
