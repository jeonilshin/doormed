import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
      role: true,
    }
  })

  return user
}

export async function getRiderFromToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    if (!payload || !payload.riderId) return null

    const rider = await prisma.rider.findUnique({
      where: { id: payload.riderId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
      }
    })

    return rider
  } catch (error) {
    console.error('getRiderFromToken error:', error)
    return null
  }
}

export async function verifyAuth(request: any) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return { authenticated: false, user: null }
  }

  const user = await getUserFromToken(token)
  
  if (!user) {
    return { authenticated: false, user: null }
  }

  return { authenticated: true, user }
}
