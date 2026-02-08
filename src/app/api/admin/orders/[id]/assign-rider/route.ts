import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification, NotificationTemplates } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { riderId } = await request.json()
    const orderId = params.id

    if (!riderId) {
      return NextResponse.json({ error: 'Rider ID is required' }, { status: 400 })
    }

    // Verify rider exists
    const rider = await prisma.rider.findUnique({
      where: { id: riderId }
    })

    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    // Update order with rider assignment
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        riderId,
        status: 'rider_received',
        riderReceivedAt: new Date()
      },
      include: {
        user: true
      }
    })

    // Create in-app notification for customer with rider name
    try {
      const riderName = `${rider.firstName} ${rider.lastName}`
      const notificationData = NotificationTemplates.riderAssigned(order.id, riderName)
      await createNotification({
        userId: order.userId,
        ...notificationData
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json({ order, success: true })
  } catch (error) {
    console.error('Assign rider error:', error)
    return NextResponse.json({ error: 'Failed to assign rider' }, { status: 500 })
  }
}
