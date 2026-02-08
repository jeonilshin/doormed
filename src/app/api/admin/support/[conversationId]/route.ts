import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get messages for a specific conversation (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const messages = await prisma.supportMessage.findMany({
      where: {
        conversationId: params.conversationId
      },
      orderBy: { createdAt: 'asc' }
    })

    // Get user info
    const userId = messages[0]?.userId
    let conversationUser = null
    if (userId) {
      conversationUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      })
    }

    return NextResponse.json({ 
      messages,
      user: conversationUser
    })
  } catch (error) {
    console.error('Get conversation messages error:', error)
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}
