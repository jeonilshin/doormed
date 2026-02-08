import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get user's family members
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

    const familyMembers = await prisma.familyMember.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ familyMembers })
  } catch (error) {
    console.error('Get family members error:', error)
    return NextResponse.json({ error: 'Failed to get family members' }, { status: 500 })
  }
}

// Add family member (send invitation)
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
    const { email, name, relationship, accessLevel } = body

    // Validate input
    if (!email || !name || !relationship || !accessLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already invited
    const existing = await prisma.familyMember.findFirst({
      where: {
        userId: user.id,
        email: email.toLowerCase()
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already invited this email' }, { status: 400 })
    }

    // Create invitation
    const familyMember = await prisma.familyMember.create({
      data: {
        userId: user.id,
        email: email.toLowerCase(),
        name,
        relationship,
        accessLevel,
        status: 'pending'
      }
    })

    // TODO: Send invitation email via Resend
    // await sendFamilyInvitationEmail(email, user, familyMember)

    return NextResponse.json({ familyMember })
  } catch (error) {
    console.error('Add family member error:', error)
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 })
  }
}
