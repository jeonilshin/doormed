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

    const orderId = params.id

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date()
      },
      include: {
        user: true,
        delivery: true
      }
    })

    // Create in-app notification instead of email
    try {
      const template = NotificationTemplates.orderConfirmed(order.id)
      await createNotification({
        userId: order.userId,
        ...template
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Confirm order error:', error)
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 })
  }
}
