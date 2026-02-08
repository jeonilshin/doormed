import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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
    const { deliveryPhoto } = await request.json()

    if (!deliveryPhoto) {
      return NextResponse.json({ error: 'Delivery photo is required' }, { status: 400 })
    }

    // Verify order belongs to this rider
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.riderId !== decoded.riderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update order with delivery photo
    // Status becomes "pending_confirmation" for admin/rider review
    // But customer will see it as "delivered"
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPhoto,
        status: 'pending_confirmation' // Admin needs to confirm
      }
    })

    // Create notification for customer showing as delivered
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'delivered',
        title: 'Order Delivered',
        message: `Your order has been delivered! Thank you for choosing DoorMedExpress.`,
        orderId: order.id
      }
    })

    return NextResponse.json({ order: updatedOrder, success: true })
  } catch (error) {
    console.error('Mark delivered error:', error)
    return NextResponse.json({ error: 'Failed to mark as delivered' }, { status: 500 })
  }
}
