import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            medication: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { addressId, items, subtotal, tax, shipping, total } = body

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId,
        subtotal,
        tax,
        shipping,
        total,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            medicationId: item.medicationId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            medication: true,
          },
        },
      },
    })

    // Create delivery
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + 7)

    await prisma.delivery.create({
      data: {
        orderId: order.id,
        userId: user.id,
        addressId,
        status: 'pending',
        estimatedDate,
      },
    })

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(user.email, {
        id: order.id,
        total: order.total,
        estimatedDelivery: estimatedDate.toLocaleDateString(),
      })
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
