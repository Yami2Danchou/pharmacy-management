import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'labdrug-secret-key-change-in-production')

export async function createSession(user) {
  const token = await new SignJWT({
    userId: user.user_id,
    username: user.username,
    role: user.role,
    employeeId: user.employee_id,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret)
  return token
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  return verifySession(token)
}

export function requireRole(...roles) {
  return async (session) => {
    if (!session) return false
    return roles.includes(session.role)
  }
}
