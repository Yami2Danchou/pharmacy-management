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
    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10)
      const result = await sql`
        UPDATE users SET
          username = ${username},
          role = ${role},
          employee_id = ${employee_id},
          is_active = ${is_active},
          password_hash = ${hash}
        WHERE user_id = ${id}
        RETURNING user_id, username, role, is_active
      `
      return NextResponse.json(result[0])
    } else {
      const result = await sql`
        UPDATE users SET
          username = ${username},
          role = ${role},
          employee_id = ${employee_id},
          is_active = ${is_active}
        WHERE user_id = ${id}
        RETURNING user_id, username, role, is_active
      `
      return NextResponse.json(result[0])
    }
  } catch (err) {
    if (err.message.includes('unique')) return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    if (Number(id) === session.userId) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    await sql`DELETE FROM users WHERE user_id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
