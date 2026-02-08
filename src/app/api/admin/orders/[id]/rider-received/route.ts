import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderStatusEmail } from '@/lib/email'

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
        status: 'rider_received',
        riderReceivedAt: new Date()
      },
      include: {
        user: true,
        delivery: true
      }
    })

    // Send rider received email to customer
    try {
      await sendOrderStatusEmail(order.user.email, {
        status: 'rider_received',
        orderNumber: order.id
      })
    } catch (emailError) {
      console.error('Failed to send rider received email:', emailError)
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Rider received order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
