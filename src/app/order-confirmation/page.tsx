'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Package, Calendar, Home } from 'lucide-react'

export default function OrderConfirmation() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const subscriptionId = searchParams.get('subscriptionId')
  const type = searchParams.get('type') || 'order'
  const paymentMethod = searchParams.get('paymentMethod') || 'Credit Card'
  
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    if (orderId) {
      setOrderNumber(orderId)
    } else if (subscriptionId) {
      setOrderNumber(subscriptionId)
    } else {
      setOrderNumber(`DME-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`)
    }
  }, [orderId, subscriptionId])

  const isSubscription = type === 'subscription'

  return (
    <div className="min-h-screen bg-[#f2f7e8] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-4xl font-serif italic text-[#1b4332] mb-4">
            {isSubscription ? 'Subscription Confirmed!' : 'Order Confirmed!'}
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            {isSubscription 
              ? 'Thank you for subscribing! Your subscription has been successfully set up.'
              : 'Thank you for your order. We&apos;ve received your order and will start preparing it soon.'}
          </p>

          <div className="bg-[#f2f7e8] rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <Package className="h-6 w-6 text-[#1b4332] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#1b4332] mb-1">
                    {isSubscription ? 'Subscription ID' : 'Order Number'}
                  </p>
                  <p className="text-gray-600 text-sm break-all">{orderNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-6 w-6 text-[#1b4332] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#1b4332] mb-1">
                    {isSubscription ? 'First Delivery' : 'Estimated Delivery'}
                  </p>
                  <p className="text-gray-600">
                    {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 text-left p-4 bg-blue-50 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Confirmation email sent</p>
                <p>Check your inbox for {isSubscription ? 'subscription' : 'order'} details and tracking information.</p>
              </div>
            </div>
            {isSubscription && (
              <div className="flex items-start gap-3 text-left p-4 bg-green-50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Subscription activated</p>
                  <p>Your medications will be delivered automatically based on your selected plan.</p>
                </div>
              </div>
            )}
            {!isSubscription && paymentMethod === 'cod' && (
              <div className="flex items-start gap-3 text-left p-4 bg-yellow-50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Cash on Delivery</p>
                  <p>Please prepare the exact amount when your order arrives.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="flex items-center justify-center gap-2 bg-[#1b4332] text-[#c9e265] px-8 py-4 rounded-xl hover:bg-[#143528] transition font-medium"
            >
              <Home className="h-5 w-5" />
              Go to Dashboard
            </a>
            <a
              href={isSubscription ? '/dashboard/subscriptions' : '/dashboard/deliveries'}
              className="flex items-center justify-center gap-2 bg-white text-[#1b4332] px-8 py-4 rounded-xl hover:bg-gray-50 transition font-medium border border-gray-200"
            >
              {isSubscription ? 'View Subscription' : 'Track Order'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
