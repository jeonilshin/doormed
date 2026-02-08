'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search,
  Filter,
  Eye,
  CheckCircle,
  Package,
  Truck,
  Clock,
  XCircle,
  AlertCircle,
  Archive,
  Trash2,
  ArchiveRestore,
  ShoppingCart,
  X
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
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
  paymentMethod?: string
  deliveryPhoto?: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  items: {
    quantity: number
    price: number
    medication: {
      name: string
      dosage: string
    }
  }[]
  address: {
    street: string
    barangay?: string
    city: string
    province: string
    zipCode: string
  }
  rider?: {
    firstName: string
    lastName: string
    phone: string
    vehicleType: string
  }
}

export default function OrdersManagement() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [riders, setRiders] = useState<any[]>([])
  const [selectedRider, setSelectedRider] = useState('')
  const [viewArchived, setViewArchived] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [showNewOrderBanner, setShowNewOrderBanner] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  useEffect(() => {
    checkAdminAuth()
    setLoading(true)
    setOrders([])
    fetchOrders()
    fetchRiders()
    // Removed auto-refresh for better performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewArchived])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      if (!response.ok) {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/admin/orders?archived=${viewArchived}`)
      if (response.ok) {
        const data = await response.json()
        const newOrders = data.orders
        
        // Check for new pending orders
        if (!viewArchived && orders.length > 0) {
          const newPendingOrders = newOrders.filter((order: Order) => 
            order.status === 'pending' && 
            !orders.find(o => o.id === order.id)
          )
          
          if (newPendingOrders.length > 0) {
            setNewOrdersCount(newPendingOrders.length)
            setShowNewOrderBanner(true)
          }
        }
        
        setOrders(newOrders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiders = async () => {
    try {
      const response = await fetch('/api/admin/riders')
      if (response.ok) {
        const data = await response.json()
        setRiders(data.riders)
      }
    } catch (error) {
      console.error('Failed to fetch riders:', error)
    }
  }

  const handleAssignRider = async (orderId: string) => {
    if (!selectedRider) {
      setSuccessMessage('Please select a rider')
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 10000)
      return
    }

    setConfirmAction({
      show: true,
      title: 'Assign Rider',
      message: 'Are you sure you want to assign this rider to the order?',
      onConfirm: async () => {
        setConfirmAction(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/admin/orders/${orderId}/assign-rider`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ riderId: selectedRider })
          })
          
          if (response.ok) {
            await fetchOrders()
            if (selectedOrder?.id === orderId) {
              const updatedOrder = orders.find(o => o.id === orderId)
              if (updatedOrder) {
                setSelectedOrder(updatedOrder)
              }
            }
            setSelectedRider('')
            setSuccessMessage('Rider assigned successfully! Customer has been notified.')
            setShowSuccessModal(true)
            setTimeout(() => setShowSuccessModal(false), 10000)
          } else {
            setSuccessMessage('Failed to assign rider')
            setShowSuccessModal(true)
            setTimeout(() => setShowSuccessModal(false), 10000)
          }
        } catch (error) {
          console.error('Failed to assign rider:', error)
          setSuccessMessage('Error: Failed to assign rider')
          setShowSuccessModal(true)
          setTimeout(() => setShowSuccessModal(false), 10000)
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const handleArchiveOrder = async (orderId: string) => {
    setConfirmAction({
      show: true,
      title: 'Archive Order',
      message: 'Are you sure you want to archive this order?',
      onConfirm: async () => {
        setConfirmAction(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/admin/orders/${orderId}/archive`, {
            method: 'POST'
          })
          
          if (response.ok) {
            await fetchOrders()
            setSelectedOrder(null)
            setSuccessMessage('Order archived successfully!')
            setShowSuccessModal(true)
            setTimeout(() => setShowSuccessModal(false), 10000)
          } else {
            setSuccessMessage('Failed to archive order')
            setShowSuccessModal(true)
            setTimeout(() => setShowSuccessModal(false), 10000)
          }
        } catch (error) {
          console.error('Failed to archive order:', error)
          setSuccessMessage('Error: Failed to archive order')
          setShowSuccessModal(true)
          setTimeout(() => setShowSuccessModal(false), 10000)
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const handleUnarchiveOrder = async (orderId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/unarchive`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchOrders()
        setSelectedOrder(null)
        setSuccessMessage('Order unarchived successfully!')
        setShowSuccessModal(true)
        setTimeout(() => setShowSuccessModal(false), 10000)
      } else {
        setSuccessMessage('Failed to unarchive order')
        setShowSuccessModal(true)
        setTimeout(() => setShowSuccessModal(false), 10000)
      }
    } catch (error) {
      console.error('Failed to unarchive order:', error)
      setSuccessMessage('Error: Failed to unarchive order')
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 10000)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    setConfirmAction({
      show: true,
      title: 'Delete Order',
      message: 'Are you sure you want to permanently delete this order? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmAction(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/admin/orders/${orderId}/delete`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            await fetchOrders()
            setSelectedOrder(null)
            setSuccessMessage('Order deleted successfully!')
            setShowSuccessModal(true)
            setTimeout(() => setShowSuccessModal(false), 10000)
          } else {
            setSuccessMessage('Failed to delete order')
            setShowSuccessModal(true)
            setTimeout(() => setShowSuccessModal(false), 10000)
          }
        } catch (error) {
          console.error('Failed to delete order:', error)
          setSuccessMessage('Error: Failed to delete order')
          setShowSuccessModal(true)
          setTimeout(() => setShowSuccessModal(false), 10000)
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const handleOrderAction = async (orderId: string, action: string) => {
    const actionLabels: Record<string, string> = {
      confirm: 'confirm this order',
      prepare: 'start preparing this order',
      ready: 'mark this order as ready',
      reject: 'reject this order',
      'confirm-delivery': 'confirm delivery'
    }

    setConfirmAction({
      show: true,
      title: `Confirm Action`,
      message: `Are you sure you want to ${actionLabels[action] || action}?`,
      onConfirm: async () => {
        setConfirmAction(null)
        setActionLoading(true)
        try {
          const response = await fetch(`/api/admin/orders/${orderId}/${action}`, {
            method: 'POST'
          })
          
          if (response.ok) {
            await fetchOrders()
            if (selectedOrder?.id === orderId) {
              const updatedOrder = orders.find(o => o.id === orderId)
              if (updatedOrder) {
                setSelectedOrder(updatedOrder)
              }
            }
            
            const successMessages: Record<string, string> = {
              confirm: 'Order confirmed! Customer has been notified.',
              prepare: 'Order marked as preparing.',
              ready: 'Order marked as ready! Customer has been notified.',
              reject: 'Order rejected! Customer has been notified.',
              'confirm-delivery': 'Delivery confirmed! Customer has been notified.'
            }
            
            setSuccessMessage(successMessages[action] || 'Action completed successfully!')
            setShowSuccessModal(true)
            
            // Auto-close after 10 seconds
            setTimeout(() => {
              setShowSuccessModal(false)
            }, 10000)
          } else {
            setSuccessMessage(`Failed to ${action} order`)
            setShowSuccessModal(true)
            setTimeout(() => setShowSuccessModal(false), 10000)
          }
        } catch (error) {
          console.error(`Failed to ${action} order:`, error)
          setSuccessMessage(`Error: Failed to ${action} order`)
          setShowSuccessModal(true)
          setTimeout(() => setShowSuccessModal(false), 10000)
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'rider_received', 'out_for_delivery', 'pending_confirmation', 'delivered', 'cancelled']
  
  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
    confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Confirmed' },
    preparing: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package, label: 'Preparing' },
    ready: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CheckCircle, label: 'Ready' },
    rider_received: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: Truck, label: 'Rider Received' },
    out_for_delivery: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Truck, label: 'Out for Delivery' },
    pending_confirmation: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle, label: 'Pending Confirmation' },
    delivered: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' }
  }

  const getAvailableActions = (status: string) => {
    const actions = []
    if (status === 'pending') {
      actions.push({ action: 'confirm', label: 'Confirm Order', color: 'bg-blue-600 hover:bg-blue-700' })
      actions.push({ action: 'reject', label: 'Reject Order', color: 'bg-red-600 hover:bg-red-700' })
    }
    if (status === 'confirmed') {
      actions.push({ action: 'prepare', label: 'Start Preparing', color: 'bg-purple-600 hover:bg-purple-700' })
    }
    if (status === 'preparing') {
      actions.push({ action: 'ready', label: 'Mark Ready', color: 'bg-indigo-600 hover:bg-indigo-700' })
    }
    // Removed rider-received action - now using assign rider dropdown
    return actions
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const preparingOrders = orders.filter(o => o.status === 'preparing').length
  const readyOrders = orders.filter(o => o.status === 'ready').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* New Order Notification Banner */}
        {showNewOrderBanner && !viewArchived && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {newOrdersCount} New Order{newOrdersCount > 1 ? 's' : ''} Received!
                </p>
                <p className="text-sm text-blue-700">
                  Please review and confirm the new order{newOrdersCount > 1 ? 's' : ''}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewOrderBanner(false)}
              className="text-blue-500 hover:text-blue-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif italic text-[#1b4332]">Orders Management</h1>
          <p className="text-gray-600 mt-2">Track and manage customer orders</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setViewArchived(false)}
            className={`px-6 py-3 font-medium transition relative ${
              !viewArchived
                ? 'text-[#1b4332] border-b-2 border-[#1b4332]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Orders
            {!viewArchived && pendingOrders > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingOrders}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`px-6 py-3 font-medium transition ${
              viewArchived
                ? 'text-[#1b4332] border-b-2 border-[#1b4332]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Archived Orders
          </button>
        </div>

        {/* Stats - Only show for active orders */}
        {!viewArchived && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-[#1b4332] mt-1">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingOrders}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Preparing</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{preparingOrders}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{readyOrders}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-[#1b4332] mt-1">{formatPHP(totalRevenue)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : statusConfig[status]?.label || status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1b4332]"></div>
              <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f2f7e8]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const config = statusConfig[order.status]
                    const Icon = config?.icon || Clock
                    const availableActions = getAvailableActions(order.status)
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.user.firstName} {order.user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{order.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items.length} item(s)
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatPHP(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config?.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {config?.label || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-PH')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {availableActions.map(({ action, label, color }) => (
                              <button
                                key={action}
                                onClick={() => handleOrderAction(order.id, action)}
                                disabled={actionLoading}
                                className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition ${color} disabled:opacity-50`}
                                title={label}
                              >
                                {label}
                              </button>
                            ))}
                            {!viewArchived ? (
                              <button
                                onClick={() => handleArchiveOrder(order.id)}
                                disabled={actionLoading}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                                title="Archive Order"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleUnarchiveOrder(order.id)}
                                  disabled={actionLoading}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                  title="Unarchive Order"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  disabled={actionLoading}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                  title="Delete Order"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif italic text-[#1b4332]">Order Details</h2>
                    <p className="text-sm text-gray-600 mt-1">Order ID: {selectedOrder.id}</p>
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
                  <div className="flex items-center gap-3">
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
                </div>

                {/* Quick Actions */}
                {getAvailableActions(selectedOrder.status).length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="flex gap-2 flex-wrap">
                      {getAvailableActions(selectedOrder.status).map(({ action, label, color }) => (
                        <button
                          key={action}
                          onClick={() => handleOrderAction(selectedOrder.id, action)}
                          disabled={actionLoading}
                          className={`px-4 py-2 text-white font-medium rounded-xl transition ${color} disabled:opacity-50`}
                        >
                          {actionLoading ? 'Processing...' : label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assign Rider */}
                {selectedOrder.status === 'ready' && !selectedOrder.rider && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Assign Rider</h3>
                    <div className="flex gap-3">
                      <select
                        value={selectedRider}
                        onChange={(e) => setSelectedRider(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                      >
                        <option value="">Select a rider...</option>
                        {riders.map((rider) => (
                          <option key={rider.id} value={rider.id}>
                            {rider.firstName} {rider.lastName} - {rider.vehicleType}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignRider(selectedOrder.id)}
                        disabled={!selectedRider || actionLoading}
                        className="px-6 py-2 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-[#f2f7e8] rounded-xl p-4">
                    <p className="font-medium">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user.email}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Delivery Address</h3>
                  <div className="bg-[#f2f7e8] rounded-xl p-4">
                    <p className="text-sm">{selectedOrder.address.street}</p>
                    <p className="text-sm">
                      {selectedOrder.address.barangay && `${selectedOrder.address.barangay}, `}
                      {selectedOrder.address.city}, {selectedOrder.address.province} {selectedOrder.address.zipCode}
                    </p>
                  </div>
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

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#1b4332]">{formatPHP(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Timestamps */}
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

                {/* Payment Method */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">
                        {selectedOrder.paymentMethod === 'credit_card' ? 'Credit Card' :
                         selectedOrder.paymentMethod === 'gcash' ? 'GCash' :
                         selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' :
                         'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rider Information */}
                {selectedOrder.rider && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Assigned Rider</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {selectedOrder.rider.firstName} {selectedOrder.rider.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedOrder.rider.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium capitalize">{selectedOrder.rider.vehicleType}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Photo */}
                {selectedOrder.deliveryPhoto && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Delivery Photo</h3>
                    <div className="bg-[#f2f7e8] rounded-xl p-4">
                      <img 
                        src={selectedOrder.deliveryPhoto} 
                        alt="Delivery proof" 
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                    {selectedOrder.status === 'pending_confirmation' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleOrderAction(selectedOrder.id, 'confirm-delivery')}
                          disabled={actionLoading}
                          className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-5 w-5" />
                          {actionLoading ? 'Confirming...' : 'Confirm Delivery'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Close Button */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition flex items-center justify-center gap-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-serif italic text-[#1b4332] mb-4">{confirmAction.title}</h3>
              <p className="text-gray-600 mb-6">{confirmAction.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction.onConfirm}
                  className="flex-1 bg-[#1b4332] text-[#c9e265] py-3 rounded-xl font-medium hover:bg-[#143528] transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-900 text-lg mb-6">{successMessage}</p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-[#1b4332] text-[#c9e265] py-3 rounded-xl font-medium hover:bg-[#143528] transition"
                >
                  Close
                </button>
                <p className="text-sm text-gray-500 mt-3">Auto-closing in 10 seconds...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
