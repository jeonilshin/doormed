import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Get stats
    const [
      totalUsers,
      totalOrders,
      orders,
      lowStockItems,
      pendingOrders,
      activeSubscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.findMany({ select: { total: true } }),
      prisma.medication.count({
        where: {
          stockQuantity: {
            lte: prisma.medication.fields.lowStockThreshold
          }
        }
      }),
      prisma.order.count({
        where: { status: 'pending' }
      }),
      prisma.subscription.count({
        where: { status: 'active' }
      })
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      lowStockItems,
      pendingOrders,
      activeSubscriptions
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
