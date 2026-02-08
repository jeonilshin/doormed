import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find rider by email
    const rider = await prisma.rider.findUnique({
      where: { email }
    })

    if (!rider) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, rider.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if rider is active
    if (rider.status === 'pending') {
      return NextResponse.json(
        { error: 'Your account is pending admin approval. Please wait for approval before logging in.' },
        { status: 403 }
      )
    }

    if (rider.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact admin.' },
        { status: 403 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { riderId: rider.id, email: rider.email, role: 'rider' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Set cookie
    const response = NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        email: rider.email,
        firstName: rider.firstName,
        lastName: rider.lastName,
        phone: rider.phone,
        vehicleType: rider.vehicleType
      }
    })

    response.cookies.set('rider_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Rider login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
