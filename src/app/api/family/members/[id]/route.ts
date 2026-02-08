import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Update family member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { accessLevel, status } = body

    // Verify ownership
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: params.id }
    })

    if (!familyMember || familyMember.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Update
    const updated = await prisma.familyMember.update({
      where: { id: params.id },
      data: {
        ...(accessLevel && { accessLevel }),
        ...(status && { status })
      }
    })

    return NextResponse.json({ familyMember: updated })
  } catch (error) {
    console.error('Update family member error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// Remove family member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify ownership
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: params.id }
    })

    if (!familyMember || familyMember.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete
    await prisma.familyMember.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete family member error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
