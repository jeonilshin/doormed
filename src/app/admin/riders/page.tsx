'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react'

interface Rider {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  vehicleType: string
  vehiclePlate?: string
  licenseNumber?: string
  status: string
  createdAt: string
  _count?: {
    orders: number
  }
}

export default function RidersManagement() {
  const router = useRouter()
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    checkAdminAuth()
    fetchRiders()
    
    // Auto-refresh every 30 seconds (reduced from 10)
    const interval = setInterval(() => {
      fetchRiders()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

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

  const fetchRiders = async () => {
    try {
      const response = await fetch('/api/admin/riders/all')
      if (response.ok) {
        const data = await response.json()
        setRiders(data.riders)
      }
    } catch (error) {
      console.error('Failed to fetch riders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (riderId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchRiders()
        setSelectedRider(null)
        alert('Rider approved successfully!')
      } else {
        alert('Failed to approve rider')
      }
    } catch (error) {
      console.error('Failed to approve rider:', error)
      alert('Error: Failed to approve rider')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (riderId: string) => {
    if (!confirm('Are you sure you want to reject this rider application?')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchRiders()
        setSelectedRider(null)
        alert('Rider rejected.')
      } else {
        alert('Failed to reject rider')
      }
    } catch (error) {
      console.error('Failed to reject rider:', error)
      alert('Error: Failed to reject rider')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async (riderId: string) => {
    if (!confirm('Are you sure you want to deactivate this rider?')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/deactivate`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchRiders()
        setSelectedRider(null)
        alert('Rider deactivated.')
      } else {
        alert('Failed to deactivate rider')
      }
    } catch (error) {
      console.error('Failed to deactivate rider:', error)
      alert('Error: Failed to deactivate rider')
    } finally {
      setActionLoading(false)
    }
  }

  const handleActivate = async (riderId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/activate`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchRiders()
        setSelectedRider(null)
        alert('Rider activated.')
      } else {
        alert('Failed to activate rider')
      }
    } catch (error) {
      console.error('Failed to activate rider:', error)
      alert('Error: Failed to activate rider')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredRiders = riders.filter(rider => {
    if (filterStatus === 'all') return true
    return rider.status === filterStatus
  })

  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending Approval', icon: Clock },
    active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Active', icon: CheckCircle },
    inactive: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Inactive', icon: XCircle },
    rejected: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Rejected', icon: XCircle }
  }

  const pendingCount = riders.filter(r => r.status === 'pending').length
  const activeCount = riders.filter(r => r.status === 'active').length
  const inactiveCount = riders.filter(r => r.status === 'inactive').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif italic text-[#1b4332]">Riders Management</h1>
          <p className="text-gray-600 mt-2">Manage delivery riders and applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Total Riders</p>
            <p className="text-2xl font-bold text-[#1b4332] mt-1">{riders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{inactiveCount}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
            >
              <option value="all">All Riders</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Riders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1b4332]"></div>
              <p className="text-gray-600 mt-4">Loading riders...</p>
            </div>
          ) : filteredRiders.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No riders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f2f7e8]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Rider</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Vehicle</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Deliveries</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRiders.map((rider) => {
                    const config = statusConfig[rider.status]
                    const Icon = config?.icon || Clock
                    
                    return (
                      <tr key={rider.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {rider.firstName} {rider.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{rider.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {rider.phone}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{rider.vehicleType}</p>
                            {rider.vehiclePlate && (
                              <p className="text-sm text-gray-600">{rider.vehiclePlate}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config?.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {config?.label || rider.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {rider._count?.orders || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRider(rider)}
                              className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
                            >
                              View Details
                            </button>
                            {rider.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(rider.id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(rider.id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {rider.status === 'active' && (
                              <button
                                onClick={() => handleDeactivate(rider.id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            )}
                            {rider.status === 'inactive' && (
                              <button
                                onClick={() => handleActivate(rider.id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                              >
                                Activate
                              </button>
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

        {/* Rider Detail Modal */}
        {selectedRider && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRider(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif italic text-[#1b4332]">Rider Details</h2>
                    <p className="text-sm text-gray-600 mt-1">ID: {selectedRider.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRider(null)}
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
                      const config = statusConfig[selectedRider.status]
                      const Icon = config?.icon || Clock
                      return (
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${config?.color}`}>
                          <Icon className="h-4 w-4" />
                          {config?.label || selectedRider.status}
                        </span>
                      )
                    })()}
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="bg-[#f2f7e8] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{selectedRider.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{selectedRider.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Vehicle Information</h3>
                  <div className="bg-[#f2f7e8] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700 capitalize">{selectedRider.vehicleType}</span>
                    </div>
                    {selectedRider.vehiclePlate && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Plate: {selectedRider.vehiclePlate}</span>
                      </div>
                    )}
                    {selectedRider.licenseNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">License: {selectedRider.licenseNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Statistics</h3>
                  <div className="bg-[#f2f7e8] rounded-xl p-4">
                    <p className="text-sm text-gray-700">Total Deliveries: <span className="font-medium">{selectedRider._count?.orders || 0}</span></p>
                    <p className="text-sm text-gray-700 mt-1">Registered: <span className="font-medium">{new Date(selectedRider.createdAt).toLocaleDateString('en-PH')}</span></p>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4">
                  <div className="flex gap-3">
                    {selectedRider.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(selectedRider.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-5 w-5" />
                          {actionLoading ? 'Approving...' : 'Approve Rider'}
                        </button>
                        <button
                          onClick={() => handleReject(selectedRider.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-5 w-5" />
                          {actionLoading ? 'Rejecting...' : 'Reject Application'}
                        </button>
                      </>
                    )}
                    {selectedRider.status === 'active' && (
                      <button
                        onClick={() => handleDeactivate(selectedRider.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        {actionLoading ? 'Deactivating...' : 'Deactivate Rider'}
                      </button>
                    )}
                    {selectedRider.status === 'inactive' && (
                      <button
                        onClick={() => handleActivate(selectedRider.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        {actionLoading ? 'Activating...' : 'Activate Rider'}
                      </button>
                    )}
                  </div>
                  
                  {/* Big Close Button */}
                  <button
                    onClick={() => setSelectedRider(null)}
                    className="w-full mt-3 bg-gray-600 text-white py-4 rounded-xl font-medium hover:bg-gray-700 transition text-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
