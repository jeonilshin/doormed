import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const riders = await prisma.rider.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        vehicleType: true,
        status: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    return NextResponse.json({ riders })
  } catch (error) {
    console.error('Get riders error:', error)
    return NextResponse.json({ error: 'Failed to get riders' }, { status: 500 })
  }
}
