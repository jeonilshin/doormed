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

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ready',
        readyAt: new Date()
      },
      include: {
        user: true,
        delivery: true
      }
    })

    // Create in-app notification for customer
    try {
      const notificationData = NotificationTemplates.orderReady(order.id)
      await createNotification({
        userId: order.userId,
        ...notificationData
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Ready order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
