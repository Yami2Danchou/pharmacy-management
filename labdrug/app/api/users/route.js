import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const users = await sql`
      SELECT u.user_id, u.username, u.role, u.is_active, e.employee_name
      FROM users u
      JOIN employee e ON u.employee_id = e.employee_id
      ORDER BY u.username
    `
    return NextResponse.json(users)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session || session.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { username, password, role, employee_id } = await request.json()
    if (!username || !password || !role || !employee_id) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    const hash = await bcrypt.hash(password, 10)
    const result = await sql`
      INSERT INTO users (username, password_hash, role, employee_id, is_active)
      VALUES (${username}, ${hash}, ${role}, ${employee_id}, true)
      RETURNING user_id, username, role, is_active
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (err) {
    if (err.message.includes('unique')) return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
