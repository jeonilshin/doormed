import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Archive a conversation (admin only)
export async function POST(
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

    // Archive all messages in this conversation
    await prisma.supportMessage.updateMany({
      where: {
        conversationId: params.conversationId
      },
      data: {
        archived: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Archive conversation error:', error)
    return NextResponse.json({ error: 'Failed to archive conversation' }, { status: 500 })
  }
}
