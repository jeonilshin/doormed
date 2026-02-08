'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Truck, MapPin, Calendar, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatPHP } from '@/lib/currency'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  confirmedAt?: string
  preparingAt?: string
  readyAt?: string
  riderReceivedAt?: string
  rider?: {
    firstName: string
    lastName: string
    phone: string
  }
  items: {
    quantity: number
    price: number
    medication: {
      name: string
      dosage: string
    }
  }[]
  delivery?: {
    id: string
    status: string
    estimatedDate: string
    deliveredAt?: string
    trackingNumber: string
    address: {
      street: string
      barangay?: string
      city: string
      province: string
      zipCode: string
    }
  }
}

export default function Deliveries() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
    // Removed auto-refresh for better performance
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/deliveries')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.deliveries || data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending', icon: Clock },
    confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Confirmed', icon: CheckCircle },
    preparing: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Preparing', icon: Package },
    ready: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Ready', icon: CheckCircle },
    rider_received: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'Rider Received', icon: Truck },
    out_for_delivery: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Out for Delivery', icon: Truck },
    pending_confirmation: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Delivered', icon: CheckCircle }, // Show as delivered to customer
    delivered: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Delivered', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelled', icon: AlertCircle }
  }

  const getOrderProgress = (order: Order) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', timestamp: order.createdAt },
      { key: 'confirmed', label: 'Confirmed', timestamp: order.confirmedAt },
      { key: 'preparing', label: 'Preparing', timestamp: order.preparingAt },
      { key: 'ready', label: 'Ready', timestamp: order.readyAt },
      { key: 'rider_received', label: 'Rider Received', timestamp: order.riderReceivedAt },
      { key: 'out_for_delivery', label: 'Out for Delivery', timestamp: null },
      { key: 'delivered', label: 'Delivered', timestamp: order.delivery?.deliveredAt }
    ]

    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'rider_received', 'out_for_delivery', 'pending_confirmation', 'delivered']
    // Treat pending_confirmation as delivered for customer view
    const displayStatus = order.status === 'pending_confirmation' ? 'delivered' : order.status
    const currentIndex = statusOrder.indexOf(displayStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  return (
    <DashboardLayout 
      currentPage="/dashboard/deliveries" 
      title="My Orders & Deliveries"
      subtitle="Track your medication orders and deliveries"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1b4332] mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => {
            const config = statusConfig[order.status]
            const Icon = config?.icon || Clock
            
            return (
              <div key={order.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-serif italic text-[#1b4332] mb-2">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config?.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {config?.label || order.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="text-[#1b4332] font-medium hover:underline text-sm"
                  >
                    View Details →
                  </button>
                </div>

                {/* Progress Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    {getOrderProgress(order).map((step, index) => (
                      <div key={step.key} className="flex-1 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            step.completed 
                              ? 'bg-[#1b4332] border-[#1b4332] text-white' 
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            {step.completed ? <CheckCircle className="h-4 w-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                          </div>
                          <p className={`text-xs mt-2 text-center ${step.completed ? 'text-[#1b4332] font-medium' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                        </div>
                        {index < getOrderProgress(order).length - 1 && (
                          <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                            step.completed ? 'bg-[#1b4332]' : 'bg-gray-300'
                          }`} style={{ transform: 'translateY(-50%)' }}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-3 p-4 bg-[#f2f7e8] rounded-xl">
                    <Calendar className="h-5 w-5 text-[#1b4332] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-[#f2f7e8] rounded-xl">
                    <Package className="h-5 w-5 text-[#1b4332] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Items</p>
                      <p className="font-medium text-gray-900 text-sm">{order.items.length} medication(s)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-[#f2f7e8] rounded-xl">
                    <Package className="h-5 w-5 text-[#1b4332] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="font-medium text-gray-900 text-sm">{formatPHP(order.total)}</p>
                    </div>
                  </div>
                </div>

                {order.delivery && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#1b4332] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Delivery Address</p>
                        <p className="text-sm text-gray-900">
                          {order.delivery.address.street}
                          {order.delivery.address.barangay && `, ${order.delivery.address.barangay}`}
                          , {order.delivery.address.city}, {order.delivery.address.province} {order.delivery.address.zipCode}
                        </p>
                      </div>
                    </div>
                    {order.delivery.trackingNumber && (
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-[#1b4332] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Tracking Number</p>
                          <p className="text-sm font-mono text-gray-900">{order.delivery.trackingNumber}</p>
                        </div>
                      </div>
                    )}
                    {order.rider && (
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-[#1b4332] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600">Rider</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {order.rider.firstName} {order.rider.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{order.rider.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No orders yet</p>
            <a 
              href="/shop" 
              className="inline-block bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
            >
              Shop Medications
            </a>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif italic text-[#1b4332]">Order Details</h2>
                    <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Status */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Current Status</h3>
                  {(() => {
                    const config = statusConfig[selectedOrder.status]
                    const Icon = config?.icon || Clock
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${config?.color}`}>
                        <Icon className="h-4 w-4" />
                        {config?.label || selectedOrder.status}
                      </span>
                    )
                  })()}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#f2f7e8] rounded-xl">
                        <div>
                          <p className="font-medium">{item.medication.name}</p>
                          <p className="text-sm text-gray-600">{item.medication.dosage}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPHP(item.price)}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#1b4332]">{formatPHP(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Placed:</span>
                      <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('en-PH')}</span>
                    </div>
                    {selectedOrder.confirmedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmed:</span>
                        <span className="font-medium">{new Date(selectedOrder.confirmedAt).toLocaleString('en-PH')}</span>
                      </div>
                    )}
                    {selectedOrder.preparingAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Started Preparing:</span>
                        <span className="font-medium">{new Date(selectedOrder.preparingAt).toLocaleString('en-PH')}</span>
                      </div>
                    )}
                    {selectedOrder.readyAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ready:</span>
                        <span className="font-medium">{new Date(selectedOrder.readyAt).toLocaleString('en-PH')}</span>
                      </div>
                    )}
                    {selectedOrder.riderReceivedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rider Received:</span>
                        <span className="font-medium">{new Date(selectedOrder.riderReceivedAt).toLocaleString('en-PH')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                {selectedOrder.delivery && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Delivery Information</h3>
                    <div className="bg-[#f2f7e8] rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-mono font-medium">{selectedOrder.delivery.trackingNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Delivery:</span>
                        <span className="font-medium">
                          {new Date(selectedOrder.delivery.estimatedDate).toLocaleDateString('en-PH', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
