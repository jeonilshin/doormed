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

    // Get two types of orders:
    // 1. Available orders (ready status) - any rider can claim
    // 2. Orders assigned to this rider
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          // Available orders (not assigned to anyone yet)
          {
            status: 'ready',
            riderId: null
          },
          // Orders assigned to this rider
          {
            riderId: decoded.riderId,
            status: {
              in: ['rider_received', 'out_for_delivery', 'pending_confirmation', 'delivered']
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        address: true,
        items: {
          include: {
            medication: {
              select: {
                name: true,
                dosage: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get deliveries error:', error)
    return NextResponse.json({ error: 'Failed to get deliveries' }, { status: 500 })
  }
}
