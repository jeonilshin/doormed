'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle2,
  Camera,
  Upload,
  LogOut,
  Clock,
  DollarSign
} from 'lucide-react'
import { formatPHP } from '@/lib/currency'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  riderId?: string | null
  paymentMethod?: string
  user: {
    firstName: string
    lastName: string
    phone: string
  }
  address: {
    street: string
    barangay: string
    city: string
    province: string
    zipCode: string
  }
  items: Array<{
    medication: {
      name: string
      dosage: string
    }
    quantity: number
  }>
}

export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [rider, setRider] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [refreshTimer, setRefreshTimer] = useState(15)

  useEffect(() => {
    fetchRiderData()
    fetchAssignedOrders()
    
    // Auto-refresh every 15 seconds (reduced from 5)
    const interval = setInterval(() => {
      fetchAssignedOrders()
      setRefreshTimer(15)
    }, 15000)
    
    // Countdown timer
    const timerInterval = setInterval(() => {
      setRefreshTimer((prev) => (prev > 0 ? prev - 1 : 15))
    }, 1000)
    
    return () => {
      clearInterval(interval)
      clearInterval(timerInterval)
    }
  }, [])

  const fetchRiderData = async () => {
    try {
      const response = await fetch('/api/rider/auth/me')
      if (response.ok) {
        const data = await response.json()
        setRider(data.rider)
      }
    } catch (error) {
      console.error('Error fetching rider data:', error)
    }
  }

  const fetchAssignedOrders = async () => {
    try {
      const response = await fetch('/api/rider/deliveries')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setRefreshTimer(15) // Reset timer on manual refresh
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPickup = async (orderId: string) => {
    try {
      const response = await fetch(`/api/rider/orders/${orderId}/pickup`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Pickup confirmed! Customer has been notified.')
        fetchAssignedOrders()
      }
    } catch (error) {
      console.error('Error confirming pickup:', error)
      alert('Failed to confirm pickup')
    }
  }

  const handleClaimOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/rider/orders/${orderId}/claim`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        alert('Order claimed successfully! Customer has been notified.')
        fetchAssignedOrders()
      } else {
        alert(data.error || 'Failed to claim order')
      }
    } catch (error) {
      console.error('Error claiming order:', error)
      alert('Failed to claim order')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDeliveryPhoto(e.target.files[0])
    }
  }

  const handleMarkDelivered = async (orderId: string) => {
    if (!deliveryPhoto) {
      alert('Please upload a delivery photo')
      return
    }

    setUploading(true)

    try {
      // Upload photo to Cloudinary
      const formData = new FormData()
      formData.append('file', deliveryPhoto)

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo')
      }

      const { url } = await uploadResponse.json()

      // Mark order as delivered
      const response = await fetch(`/api/rider/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPhoto: url })
      })

      if (response.ok) {
        alert('Order marked as delivered! Customer has been notified.')
        setSelectedOrder(null)
        setDeliveryPhoto(null)
        fetchAssignedOrders()
      }
    } catch (error) {
      console.error('Error marking delivered:', error)
      alert('Failed to mark as delivered')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/rider/auth/logout', { method: 'POST' })
      window.location.href = '/rider/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ready: 'bg-blue-100 text-blue-700',
      rider_received: 'bg-cyan-100 text-cyan-700',
      out_for_delivery: 'bg-orange-100 text-orange-700',
      pending_confirmation: 'bg-amber-100 text-amber-700',
      delivered: 'bg-green-100 text-green-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-[#f2f7e8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1b4332] rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-[#c9e265]" />
              </div>
              <div>
                <h1 className="text-xl font-serif italic text-[#1b4332]">Rider Dashboard</h1>
                {rider && (
                  <p className="text-sm text-gray-600">
                    {rider.firstName} {rider.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Auto-refresh in {refreshTimer}s</span>
              </div>
              <button
                onClick={fetchAssignedOrders}
                className="flex items-center gap-2 px-4 py-2 bg-[#1b4332] text-[#c9e265] rounded-lg hover:bg-[#143528] transition"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'ready').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">My Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'rider_received').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Out for Delivery</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'out_for_delivery').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Confirmation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending_confirmation').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivered Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif italic text-[#1b4332]">My Deliveries</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Loading deliveries...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No deliveries assigned yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-bold text-[#1b4332]">
                        {formatPHP(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-[#f2f7e8] rounded-lg p-4 mb-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Customer</p>
                        <p className="text-sm text-gray-700">
                          {order.user.firstName} {order.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {order.user.phone || 'No phone'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Delivery Address
                        </p>
                        <p className="text-sm text-gray-700">
                          {order.address.street}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.address.barangay && `${order.address.barangay}, `}
                          {order.address.city}, {order.address.province}
                        </p>
                      </div>
                    </div>
                    {order.paymentMethod && (
                      <div className="mt-4 pt-4 border-t border-[#d4e5b8]">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          <DollarSign className="inline h-4 w-4 mr-1" />
                          Payment Method
                        </p>
                        <p className="text-sm text-gray-700 capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-700">
                          • {item.medication.name} ({item.medication.dosage}) x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {order.status === 'ready' && !order.riderId && (
                      <button
                        onClick={() => handleClaimOrder(order.id)}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        Claim This Order
                      </button>
                    )}

                    {order.status === 'rider_received' && (
                      <button
                        onClick={() => handleConfirmPickup(order.id)}
                        className="flex-1 bg-[#1b4332] text-[#c9e265] py-3 rounded-lg font-medium hover:bg-[#143528] transition flex items-center justify-center gap-2"
                      >
                        <Truck className="h-5 w-5" />
                        Confirm Pickup & Start Delivery
                      </button>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <Camera className="h-5 w-5" />
                        Mark as Delivered
                      </button>
                    )}

                    {order.status === 'pending_confirmation' && (
                      <div className="flex-1 bg-amber-50 border border-amber-200 py-3 rounded-lg flex items-center justify-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="text-amber-700 font-medium">Awaiting Admin Confirmation</span>
                      </div>
                    )}

                    {order.status === 'delivered' && (
                      <div className="flex-1 bg-green-50 border border-green-200 py-3 rounded-lg flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-green-700 font-medium">Delivered & Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delivery Photo Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif italic text-[#1b4332] mb-4">
              Confirm Delivery
            </h3>
            <p className="text-gray-600 mb-6">
              Upload a photo of the delivered package to confirm delivery.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="delivery-photo"
                />
                <label
                  htmlFor="delivery-photo"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {deliveryPhoto ? (
                    <>
                      <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">
                        {deliveryPhoto.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Click to change</p>
                    </>
                  ) : (
                    <>
                      <Camera className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">
                        Take Photo or Upload
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Camera will open on mobile devices
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedOrder(null)
                  setDeliveryPhoto(null)
                }}
                disabled={uploading}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkDelivered(selectedOrder.id)}
                disabled={!deliveryPhoto || uploading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
