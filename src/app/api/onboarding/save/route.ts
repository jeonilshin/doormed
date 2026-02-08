import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Save health profile
    await prisma.healthProfile.upsert({
      where: { userId: user.id },
      update: {
        conditions: data.conditions || [],
        allergies: data.allergies || null
      },
      create: {
        userId: user.id,
        conditions: data.conditions || [],
        allergies: data.allergies || null
      }
    })

    // Update user info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        phone: data.phone || null
      }
    })

    // Save address
    if (data.street && data.city && data.state && data.zipCode) {
      await prisma.address.create({
        data: {
          userId: user.id,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          isDefault: true
        }
      })
    }

    // Save prescription if uploaded
    if (data.prescriptionNotes) {
      await prisma.prescription.create({
        data: {
          userId: user.id,
          fileName: 'prescription.txt',
          fileUrl: '/uploads/temp',
          status: 'pending',
          notes: data.prescriptionNotes
        }
      })
    }

    return NextResponse.json({
      message: 'Onboarding data saved successfully'
    })
  } catch (error) {
    console.error('Save onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}
