import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const { employee_name, employee_gender, employee_age, employee_address, employee_contacts } = await request.json()
    const result = await sql`
      UPDATE employee SET
        employee_name = ${employee_name},
        employee_gender = ${employee_gender},
        employee_age = ${employee_age},
        employee_address = ${employee_address},
        employee_contacts = ${employee_contacts}
      WHERE employee_id = ${id}
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
    await sql`DELETE FROM employee WHERE employee_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
