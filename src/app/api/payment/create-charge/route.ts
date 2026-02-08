import { NextRequest, NextResponse } from 'next/server'
import { createPaymentCharge } from '@/lib/xendit'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cardToken, amount, orderId, description } = body

    if (!cardToken || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment charge with Xendit
    const result = await createPaymentCharge({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'PHP',
      referenceId: orderId,
      description: description || `Order #${orderId}`,
      cardToken,
      customerEmail: authResult.user.email,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      charge: result.charge,
    })
  } catch (error: any) {
    console.error('Payment charge error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
