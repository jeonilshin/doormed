import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch user's medications with medication details
    const userMedications = await prisma.userMedication.findMany({
      where: { userId: user.id },
      include: {
        medication: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ medications: userMedications })
  } catch (error) {
    console.error('Get user medications error:', error)
    return NextResponse.json(
      { error: 'Failed to get medications' },
      { status: 500 }
    )
  }
}
