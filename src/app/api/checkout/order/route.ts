import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { items, addressId, paymentMethodId, paymentMethod } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)
    
    const tax = subtotal * 0.12 // 12% VAT
    const shipping = 0 // Free shipping
    const total = subtotal + tax + shipping

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId,
        status: 'pending',
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: paymentMethod || 'credit_card',
        paymentId: paymentMethodId || null
      }
    })

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          medicationId: item.medicationId,
          quantity: item.quantity,
          price: item.price
        }
      })

      // Update stock
      await prisma.medication.update({
        where: { id: item.medicationId },
        data: {
          stockQuantity: {
            decrement: item.quantity
          }
        }
      })
    }

    // Create delivery
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + 3) // 3 days delivery

    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        userId: user.id,
        addressId,
        status: 'pending',
        estimatedDate,
        trackingNumber: `DME-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`
      }
    })

    // Mark onboarding as complete if this is first order
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingComplete: true }
    })

    // Send order receipt email
    try {
      const { sendOrderReceiptEmail } = await import('@/lib/email')
      
      // Get order items with medication details
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        include: { medication: true }
      })

      // Get address details
      const address = await prisma.address.findUnique({
        where: { id: addressId }
      })

      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + 3)

      await sendOrderReceiptEmail(user.email, {
        orderNumber: order.id,
        orderDate: order.createdAt.toLocaleDateString('en-PH', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        paymentMethod: body.paymentMethod || 'Credit Card',
        estimatedDelivery: estimatedDate.toLocaleDateString('en-PH', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        items: orderItems.map(item => ({
          name: item.medication.name,
          dosage: item.medication.dosage,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        address: address || {}
      })
    } catch (emailError) {
      console.error('Failed to send order receipt email:', emailError)
      // Don't fail the order if email fails
    }

    return NextResponse.json({ 
      order,
      delivery,
      success: true
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
