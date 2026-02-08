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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orderId = params.id

    // Get order with rider info
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

    if (order.status !== 'pending_confirmation') {
      return NextResponse.json({ error: 'Order is not pending confirmation' }, { status: 400 })
    }

    // Update order status to delivered
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'delivered'
      }
    })

    // Create notification for customer
    try {
      const notificationData = NotificationTemplates.delivered(order.id)
      await createNotification({
        userId: order.userId,
        ...notificationData
      })
    } catch (notificationError) {
      console.error('Failed to create customer notification:', notificationError)
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Confirm delivery error:', error)
    return NextResponse.json({ error: 'Failed to confirm delivery' }, { status: 500 })
  }
}
