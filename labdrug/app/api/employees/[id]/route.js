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
    if (!result.length) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
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
    const [hasUser, inSupply, inStockOut, inReturns] = await Promise.all([
      sql`SELECT COUNT(*) as c FROM users WHERE employee_id = ${id}`,
      sql`SELECT COUNT(*) as c FROM supply WHERE employee_id = ${id}`,
      sql`SELECT COUNT(*) as c FROM stock_out WHERE employee_id = ${id}`,
      sql`SELECT COUNT(*) as c FROM return_of_products WHERE verified_by_employee_id = ${id}`,
    ])

    const reasons = []
    if (Number(hasUser[0].c) > 0) reasons.push(`${hasUser[0].c} user account(s) — delete the user account first`)
    if (Number(inSupply[0].c) > 0) reasons.push(`${inSupply[0].c} supply delivery record(s)`)
    if (Number(inStockOut[0].c) > 0) reasons.push(`${inStockOut[0].c} stock-out record(s)`)
    if (Number(inReturns[0].c) > 0) reasons.push(`${inReturns[0].c} verified return record(s)`)

    if (reasons.length > 0) {
      return NextResponse.json({
        error: `Cannot delete this employee because they are linked to: ${reasons.join('; ')}.`
      }, { status: 400 })
    }

    await sql`DELETE FROM employee WHERE employee_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Cannot delete this employee. They may have a linked user account or transaction records. Deactivate their user account first." }, { status: 400 })
  }
}
