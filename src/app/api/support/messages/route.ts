import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get support messages for user
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

    // Get conversation ID from query or use user's default
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId') || `conv-${user.id}`

    // Get only non-archived messages
    const messages = await prisma.supportMessage.findMany({
      where: {
        userId: user.id,
        conversationId,
        archived: false
      },
      orderBy: { createdAt: 'asc' }
    })

    // Check if conversation is archived
    const archivedMessages = await prisma.supportMessage.findFirst({
      where: {
        userId: user.id,
        conversationId,
        archived: true
      }
    })

    const isArchived = !!archivedMessages

    return NextResponse.json({ 
      messages, 
      conversationId,
      isArchived 
    })
  } catch (error) {
    console.error('Get support messages error:', error)
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}

// Send support message
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
    const { message, conversationId } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let convId = conversationId || `conv-${user.id}`

    // Check if conversation is archived
    const archivedConversation = await prisma.supportMessage.findFirst({
      where: {
        userId: user.id,
        conversationId: convId,
        archived: true
      }
    })

    // If archived, create a new conversation with timestamp
    if (archivedConversation) {
      convId = `conv-${user.id}-${Date.now()}`
    }

    // Create user message
    const userMessage = await prisma.supportMessage.create({
      data: {
        userId: user.id,
        conversationId: convId,
        sender: 'user',
        message,
        archived: false
      }
    })

    // Auto-reply from support (simulated)
    const autoReply = await prisma.supportMessage.create({
      data: {
        userId: user.id,
        conversationId: convId,
        sender: 'support',
        message: 'Thank you for contacting DoorMed Express support. A team member will respond shortly.',
        archived: false
      }
    })

    return NextResponse.json({ 
      message: userMessage,
      reply: autoReply,
      conversationId: convId
    })
  } catch (error) {
    console.error('Send support message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
