import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Email already exists' : 'Email available'
    })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    )
  }
}
