import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'preparing',
        preparingAt: new Date()
      },
      include: {
        user: true,
        delivery: true
      }
    })

    // Silent update - no notification or email
    // Customer can see status in track order page

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Prepare order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
