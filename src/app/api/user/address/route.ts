import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Add new address
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

    const { street, barangay, city, province, zipCode, isDefault } = await request.json()

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      })
    }

    // Create full street address
    const fullStreet = barangay ? `${street}, ${barangay}` : street

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        street: fullStreet,
        city,
        state: province,
        zipCode,
        isDefault: isDefault || false
      }
    })

    return NextResponse.json({ address, success: true })
  } catch (error) {
    console.error('Add address error:', error)
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 })
  }
}
