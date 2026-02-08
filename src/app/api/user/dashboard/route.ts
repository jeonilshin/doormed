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

    // Fetch dashboard data
    const [userMedications, subscriptions, nextDelivery] = await Promise.all([
      // Get user's active medications
      prisma.userMedication.findMany({
        where: { 
          userId: user.id,
          status: 'active'
        },
        include: {
          medication: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      // Get active subscriptions
      prisma.subscription.findMany({
        where: { 
          userId: user.id,
          status: 'active'
        },
        include: {
          items: {
            include: {
              medication: true
            }
          }
        },
        orderBy: { nextDelivery: 'asc' }
      }),
      
      // Get next delivery - look for active orders that haven't been delivered yet
      prisma.order.findFirst({
        where: { 
          userId: user.id,
          status: {
            in: ['pending', 'confirmed', 'preparing', 'ready', 'rider_received', 'out_for_delivery', 'pending_confirmation']
          }
        },
        include: {
          items: {
            include: {
              medication: true
            }
          },
          delivery: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Calculate stats
    const totalMedications = userMedications.length
    const averageAdherence = userMedications.length > 0
      ? Math.round(userMedications.reduce((sum, med) => sum + med.adherence, 0) / userMedications.length)
      : 0
    
    const daysUntilDelivery = nextDelivery && nextDelivery.delivery
      ? Math.ceil((new Date(nextDelivery.delivery.estimatedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({
      stats: {
        adherenceRate: averageAdherence,
        activeMedications: totalMedications,
        daysUntilDelivery
      },
      todaysMedications: userMedications,
      activeSubscriptions: subscriptions,
      nextDelivery: nextDelivery ? {
        ...nextDelivery.delivery,
        order: nextDelivery
      } : null
    })
  } catch (error) {
    console.error('Get dashboard data error:', error)
    return NextResponse.json(
      { error: 'Failed to get dashboard data' },
      { status: 500 }
    )
  }
}
