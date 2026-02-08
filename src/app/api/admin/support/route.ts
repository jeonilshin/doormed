import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all support conversations (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get query parameter for showing archived
    const { searchParams } = new URL(request.url)
    const showArchived = searchParams.get('archived') === 'true'

    // Get all conversations grouped by user (exclude archived by default)
    const conversations = await prisma.supportMessage.groupBy({
      by: ['userId', 'conversationId'],
      where: showArchived ? {} : { archived: false },
      _count: {
        id: true
      },
      _max: {
        createdAt: true
      },
      orderBy: {
        _max: {
          createdAt: 'desc'
        }
      }
    })

    // Get user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const user = await prisma.user.findUnique({
          where: { id: conv.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        })

        const messages = await prisma.supportMessage.findMany({
          where: {
            userId: conv.userId,
            conversationId: conv.conversationId,
            archived: showArchived ? undefined : false
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        })

        // Check if archived
        const isArchived = messages[0]?.archived || false

        return {
          conversationId: conv.conversationId,
          user,
          messageCount: conv._count.id,
          lastMessageAt: conv._max.createdAt,
          lastMessage: messages[0]?.message || '',
          isArchived
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithUsers })
  } catch (error) {
    console.error('Get support conversations error:', error)
    return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 })
  }
}

// Reply to support message (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, conversationId, message } = body

    if (!userId || !conversationId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create support reply
    const reply = await prisma.supportMessage.create({
      data: {
        userId,
        conversationId,
        sender: 'support',
        message
      }
    })

    return NextResponse.json({ message: reply })
  } catch (error) {
    console.error('Send support reply error:', error)
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
  }
}
