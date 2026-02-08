import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token and get user ID
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { step } = await request.json()

    // Update onboarding step
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { onboardingStep: step }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update step error:', error)
    return NextResponse.json(
      { error: 'Failed to update onboarding step' },
      { status: 500 }
    )
  }
}
