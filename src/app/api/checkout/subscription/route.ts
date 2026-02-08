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
    const { 
      packageId, 
      planType, 
      frequency, 
      preferredDay, 
      addressId, 
      paymentDetails, 
      totalAmount,
      items 
    } = body

    if (!packageId || !planType || !addressId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate next delivery date
    const nextDelivery = new Date()
    if (planType === 'one_time') {
      nextDelivery.setDate(nextDelivery.getDate() + 3) // 3 days for one-time
    } else if (planType === 'monthly' && preferredDay) {
      // Set to preferred day of next month
      nextDelivery.setMonth(nextDelivery.getMonth() + 1)
      nextDelivery.setDate(preferredDay)
    } else {
      // For semi-annual and annual
      nextDelivery.setDate(nextDelivery.getDate() + frequency)
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        name: `Subscription - ${planType}`,
        status: 'active',
        frequency: frequency || 30,
        nextDelivery,
        price: totalAmount
      }
    })

    // Create subscription items
    for (const item of items) {
      await prisma.subscriptionItem.create({
        data: {
          subscriptionId: subscription.id,
          medicationId: item.medicationId,
          quantity: item.quantity
        }
      })
    }

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        onboardingStep: 4
      }
    })

    // Send subscription receipt email
    try {
      const { sendSubscriptionReceiptEmail } = await import('@/lib/email')
      
      // Get address details
      const address = await prisma.address.findUnique({
        where: { id: addressId }
      })

      await sendSubscriptionReceiptEmail(user.email, {
        subscriptionId: subscription.id,
        planType,
        frequency: frequency || 30,
        nextDeliveryDate: nextDelivery.toLocaleDateString('en-PH', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalAmount,
        address: address || {},
        paymentMethod: 'Credit Card',
        cardLast4: paymentDetails.last4
      })
    } catch (emailError) {
      console.error('Failed to send subscription receipt email:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ 
      subscription,
      success: true
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
