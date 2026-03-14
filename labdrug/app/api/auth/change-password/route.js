import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { current_password, new_password } = await request.json()

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Both fields are required' }, { status: 400 })
    }
    if (new_password.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const users = await sql`SELECT password_hash FROM users WHERE user_id = ${session.userId}`
    if (!users.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const match = await bcrypt.compare(current_password, users[0].password_hash)
    if (!match) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })

    const hash = await bcrypt.hash(new_password, 10)
    await sql`UPDATE users SET password_hash = ${hash} WHERE user_id = ${session.userId}`

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
