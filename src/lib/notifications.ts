import { prisma } from './prisma'

export async function createNotification(params: {
  userId: string
  type: string
  title: string
  message: string
  orderId?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        orderId: params.orderId || null
      }
    })
    return notification
  } catch (error) {
    console.error('Create notification error:', error)
    return null
  }
}

// Notification templates
export const NotificationTemplates = {
  orderConfirmed: (orderId: string) => ({
    type: 'order_confirmed',
    title: 'Order Confirmed',
    message: `Your order has been confirmed and will be prepared soon.`,
    orderId
  }),
  
  orderReady: (orderId: string) => ({
    type: 'order_ready',
    title: 'Order Ready for Delivery',
    message: `Your order is ready and will be assigned to a rider soon.`,
    orderId
  }),
  
  riderAssigned: (orderId: string, riderName: string) => ({
    type: 'rider_assigned',
    title: 'Rider Assigned',
    message: `Your order has been assigned to ${riderName}.`,
    orderId
  }),
  
  outForDelivery: (orderId: string, riderName: string) => ({
    type: 'out_for_delivery',
    title: 'Out for Delivery',
    message: `${riderName} is on the way to deliver your order.`,
    orderId
  }),
  
  delivered: (orderId: string) => ({
    type: 'delivered',
    title: 'Order Delivered',
    message: `Your order has been successfully delivered!`,
    orderId
  })
}
