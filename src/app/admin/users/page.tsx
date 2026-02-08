'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  Package
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  dateOfBirth: string | null
  emailVerified: boolean
  onboardingStep: number
  createdAt: string
  _count: {
    orders: number
    subscriptions: number
  }
}

export default function UsersManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    checkAdminAuth()
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower)
    )
  })

  const totalOrders = users.reduce((sum, u) => sum + u._count.orders, 0)
  const totalSubscriptions = users.reduce((sum, u) => sum + u._count.subscriptions, 0)
  const verifiedUsers = users.filter(u => u.emailVerified).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif italic text-[#1b4332]">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage customer accounts and profiles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-[#1b4332] mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Verified Users</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{verifiedUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-[#1b4332] mt-1">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Active Subscriptions</p>
            <p className="text-2xl font-bold text-[#1b4332] mt-1">{totalSubscriptions}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1b4332]"></div>
              <p className="text-gray-600 mt-4">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f2f7e8]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Orders</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Subscriptions</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {user.emailVerified ? (
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user._count.orders}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user._count.subscriptions}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif italic text-[#1b4332]">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">
                        {selectedUser.dateOfBirth 
                          ? new Date(selectedUser.dateOfBirth).toLocaleDateString()
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Account Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email Verified</p>
                      <p className="font-medium">
                        {selectedUser.emailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Onboarding</p>
                      <p className="font-medium">
                        {selectedUser.onboardingStep === 5 ? 'Complete' : `Step ${selectedUser.onboardingStep}/5`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="font-medium">{selectedUser._count.orders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Subscriptions</p>
                      <p className="font-medium">{selectedUser._count.subscriptions}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
