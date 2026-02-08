import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

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
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const orderId = params.id

    // Get order details for notification
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status to cancelled
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled'
      }
    })

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Your order has been cancelled by the admin. If you have any questions, please contact support.`,
        orderId: order.id
      }
    })

    return NextResponse.json({ order: updatedOrder, success: true })
  } catch (error) {
    console.error('Reject order error:', error)
    return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 })
  }
}
