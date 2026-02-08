import { NextRequest, NextResponse } from 'next/server'
import { tokenizeCard } from '@/lib/xendit'
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
    const { cardNumber, cardExpMonth, cardExpYear, cardCvn } = body

    if (!cardNumber || !cardExpMonth || !cardExpYear || !cardCvn) {
      return NextResponse.json(
        { error: 'Missing required card fields' },
        { status: 400 }
      )
    }

    // Tokenize card with Xendit
    const result = await tokenizeCard({
      cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
      cardExpMonth,
      cardExpYear,
      cardCvn,
      isMultipleUse: false,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Card tokenization failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      token: result.token,
    })
  } catch (error: any) {
    console.error('Card tokenization error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
