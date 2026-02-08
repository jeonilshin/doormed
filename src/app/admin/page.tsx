'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    activeSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAuth()
    fetchStats()
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    {
      title: 'Revenue (PHP)',
      value: `₱${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      href: '/admin/orders'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/admin/inventory'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Activity,
      color: 'bg-yellow-500',
      href: '/admin/orders'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      href: '/admin/users'
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif italic text-[#1b4332]">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your DoorMed Express platform</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                <div className="h-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => (
              <a
                key={stat.title}
                href={stat.href}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1b4332] transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-[#1b4332]">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm text-gray-500 group-hover:text-[#1b4332] transition">
                  View details →
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-serif italic text-[#1b4332] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/inventory"
              className="flex items-center gap-3 p-4 bg-[#f2f7e8] rounded-xl hover:bg-[#e4ecd8] transition"
            >
              <Package className="h-5 w-5 text-[#1b4332]" />
              <span className="font-medium text-[#1b4332]">Manage Inventory</span>
            </a>
            <a
              href="/admin/orders"
              className="flex items-center gap-3 p-4 bg-[#f2f7e8] rounded-xl hover:bg-[#e4ecd8] transition"
            >
              <ShoppingCart className="h-5 w-5 text-[#1b4332]" />
              <span className="font-medium text-[#1b4332]">View Orders</span>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-[#f2f7e8] rounded-xl hover:bg-[#e4ecd8] transition"
            >
              <Users className="h-5 w-5 text-[#1b4332]" />
              <span className="font-medium text-[#1b4332]">Manage Users</span>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
