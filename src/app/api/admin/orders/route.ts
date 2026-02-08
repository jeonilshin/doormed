import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET - Fetch all orders
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Get archived parameter from query string
    const { searchParams } = new URL(request.url)
    const showArchived = searchParams.get('archived') === 'true'

    const orders = await prisma.order.findMany({
      where: {
        archived: showArchived
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        rider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            vehicleType: true
          }
        },
        items: {
          include: {
            medication: {
              select: {
                name: true,
                dosage: true
              }
            }
          }
        },
        address: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { orderId, status } = body

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    // If order is delivered, update delivery status
    if (status === 'delivered') {
      await prisma.delivery.updateMany({
        where: { orderId },
        data: { 
          status: 'delivered',
          deliveredAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
