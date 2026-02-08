'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Package, Calendar, DollarSign, Edit, Pause } from 'lucide-react'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/user/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout 
      currentPage="/dashboard/subscriptions" 
      title="My Subscriptions"
      subtitle="Manage your automatic deliveries"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif italic text-[#1b4332] mb-2">{sub.name}</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition">
                    <Pause className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3 p-4 bg-[#f2f7e8] rounded-xl">
                  <Package className="h-5 w-5 text-[#1b4332]" />
                  <div>
                    <p className="text-xs text-gray-600">Frequency</p>
                    <p className="font-medium text-gray-900">Every {sub.frequency} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#f2f7e8] rounded-xl">
                  <Calendar className="h-5 w-5 text-[#1b4332]" />
                  <div>
                    <p className="text-xs text-gray-600">Next Delivery</p>
                    <p className="font-medium text-gray-900">
                      {new Date(sub.nextDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#f2f7e8] rounded-xl">
                  <DollarSign className="h-5 w-5 text-[#1b4332]" />
                  <div>
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="font-medium text-gray-900">₱{sub.price.toLocaleString()}/mo</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Included Items:</p>
                <ul className="space-y-1">
                  {sub.items.map((item: any) => (
                    <li key={item.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#1b4332] rounded-full"></span>
                      {item.medication.name} ({item.quantity} units)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No active subscriptions</p>
            <a 
              href="/shop" 
              className="inline-block bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
            >
              Create Subscription
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
