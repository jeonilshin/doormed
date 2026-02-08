import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { createNotification, NotificationTemplates } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('rider_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const orderId = params.id

    // Get the order and rider info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order is available (ready status and no rider assigned)
    if (order.status !== 'ready' || order.riderId !== null) {
      return NextResponse.json({ 
        error: 'Order is no longer available. Another rider may have claimed it.' 
      }, { status: 400 })
    }

    // Get rider info
    const rider = await prisma.rider.findUnique({
      where: { id: decoded.riderId }
    })

    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    // Claim the order (assign to this rider)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        riderId: decoded.riderId,
        status: 'rider_received',
        riderReceivedAt: new Date()
      }
    })

    // Create notification for customer with rider name
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

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: 'Order claimed successfully!'
    })
  } catch (error) {
    console.error('Claim order error:', error)
    return NextResponse.json({ error: 'Failed to claim order' }, { status: 500 })
  }
}
