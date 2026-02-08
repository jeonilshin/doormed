import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('rider_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any

    const rider = await prisma.rider.findUnique({
      where: { id: decoded.riderId }
    })

    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    return NextResponse.json({
      rider: {
        id: rider.id,
        email: rider.email,
        firstName: rider.firstName,
        lastName: rider.lastName,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        status: rider.status
      }
    })
  } catch (error) {
    console.error('Get rider error:', error)
    return NextResponse.json({ error: 'Failed to get rider' }, { status: 500 })
  }
}
