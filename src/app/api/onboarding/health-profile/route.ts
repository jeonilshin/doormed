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

    const { dateOfBirth, gender, conditions, allergies } = await request.json()

    // Update user with basic info and onboarding step
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        onboardingStep: 1 // Completed step 1
      }
    })

    // Create or update health profile
    await prisma.healthProfile.upsert({
      where: { userId: decoded.userId },
      update: {
        conditions: conditions || [],
        allergies: allergies || null
      },
      create: {
        userId: decoded.userId,
        conditions: conditions || [],
        allergies: allergies || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Health profile error:', error)
    return NextResponse.json(
      { error: 'Failed to save health profile' },
      { status: 500 }
    )
  }
}
