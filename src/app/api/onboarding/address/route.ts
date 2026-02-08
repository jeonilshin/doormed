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

    const { houseNumber, additionalAddress, province, city, barangay, zipCode, phone } = await request.json()

    // Update user phone and onboarding step
    if (phone) {
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          phone,
          onboardingStep: 2 // Completed step 2
        }
      })
    } else {
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          onboardingStep: 2 // Completed step 2
        }
      })
    }

    // Create address (combine all address parts)
    const fullAddress = [houseNumber, additionalAddress, barangay].filter(Boolean).join(', ')
    
    await prisma.address.create({
      data: {
        userId: decoded.userId,
        street: fullAddress,
        city,
        state: province,
        zipCode,
        isDefault: true // First address is default
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Address error:', error)
    return NextResponse.json(
      { error: 'Failed to save address' },
      { status: 500 }
    )
  }
}
