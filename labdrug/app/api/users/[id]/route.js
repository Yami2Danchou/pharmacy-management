import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const { username, role, employee_id, is_active, password } = await request.json()
    let result
    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10)
      result = await sql`
        UPDATE users SET username = ${username}, role = ${role}, employee_id = ${employee_id}, is_active = ${is_active}, password_hash = ${hash}
        WHERE user_id = ${id} RETURNING user_id, username, role, is_active
      `
    } else {
      result = await sql`
        UPDATE users SET username = ${username}, role = ${role}, employee_id = ${employee_id}, is_active = ${is_active}
        WHERE user_id = ${id} RETURNING user_id, username, role, is_active
      `
    }
    if (!result.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(result[0])
  } catch (err) {
    if (err.message.includes('unique')) return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    if (Number(id) === Number(session.userId)) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
    }

    const [inSales, inSupply, inStockOut] = await Promise.all([
      sql`SELECT COUNT(*) as c FROM sale WHERE user_id = ${id}`,
      sql`SELECT COUNT(*) as c FROM supply WHERE user_id = ${id}`,
      sql`SELECT COUNT(*) as c FROM stock_out WHERE user_id = ${id}`,
    ])

    const reasons = []
    if (Number(inSales[0].c) > 0) reasons.push(`${inSales[0].c} sales transaction(s)`)
    if (Number(inSupply[0].c) > 0) reasons.push(`${inSupply[0].c} supply delivery record(s)`)
    if (Number(inStockOut[0].c) > 0) reasons.push(`${inStockOut[0].c} stock-out record(s)`)

    if (reasons.length > 0) {
      return NextResponse.json({
        error: `Cannot delete this account because it is linked to: ${reasons.join(', ')}. Consider setting the account to Inactive instead.`
      }, { status: 400 })
    }

    await sql`DELETE FROM users WHERE user_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Cannot delete this user account." }, { status: 400 })
  }
}
