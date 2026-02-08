import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const riderId = params.id

    const rider = await prisma.rider.update({
      where: { id: riderId },
      data: { status: 'inactive' }
    })

    return NextResponse.json({ success: true, rider })
  } catch (error) {
    console.error('Deactivate rider error:', error)
    return NextResponse.json({ error: 'Failed to deactivate rider' }, { status: 500 })
  }
}
