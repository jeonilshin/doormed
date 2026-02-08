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

    // Verify order belongs to this rider and get rider info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        rider: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.riderId !== decoded.riderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update order status to out_for_delivery
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'out_for_delivery'
      }
    })

    // Create in-app notification for customer with rider name
    try {
      const riderName = order.rider 
        ? `${order.rider.firstName} ${order.rider.lastName}`
        : 'Your rider'
      const notificationData = NotificationTemplates.outForDelivery(order.id, riderName)
      await createNotification({
        userId: order.userId,
        ...notificationData
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json({ order: updatedOrder, success: true })
  } catch (error) {
    console.error('Confirm pickup error:', error)
    return NextResponse.json({ error: 'Failed to confirm pickup' }, { status: 500 })
  }
}
