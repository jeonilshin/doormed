'use client'

import { useState, useEffect } from 'react'
import { 
  Home,
  Pill,
  Package,
  Users,
  User,
  MessageSquare,
  Bell,
  Menu,
  X,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  LogOut,
  Shield
} from 'lucide-react'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    fetchDashboardData()
    
    // Auto-refresh dashboard data every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAdmin(data.user?.role === 'admin')
        
        // Check if email is verified
        if (!data.user?.emailVerified) {
          // Redirect to a verification required page or show banner
          // For now, we'll handle it in the UI
        }
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      window.location.href = '/login'
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
    { name: 'Medications', href: '/dashboard/medications', icon: Pill, current: false },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Package, current: false },
    { name: 'Deliveries', href: '/dashboard/deliveries', icon: Package, current: false },
    { name: 'Family Access', href: '/dashboard/family', icon: Users, current: false },
    { name: 'Support', href: '/dashboard/support', icon: MessageSquare, current: false },
  ]

  const shopLink = { name: 'Shop', href: '/shop', icon: Package }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      window.location.replace('/login')
    }
  }

  // Real data from API
  const stats = dashboardData ? [
    { 
      label: 'Adherence Rate', 
      value: dashboardData.stats.adherenceRate > 0 ? `${dashboardData.stats.adherenceRate}%` : 'N/A', 
      icon: TrendingUp, 
      color: 'text-green-600' 
    },
    { 
      label: 'Active Medications', 
      value: dashboardData.stats.activeMedications.toString(), 
      icon: Pill, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Days Until Delivery', 
      value: dashboardData.stats.daysUntilDelivery !== null ? dashboardData.stats.daysUntilDelivery.toString() : 'N/A', 
      icon: Calendar, 
      color: 'text-yellow-600' 
    },
  ] : []

  const todaysMedications = dashboardData?.todaysMedications || []
  const activeSubscriptions = dashboardData?.activeSubscriptions || []
  const nextDelivery = dashboardData?.nextDelivery

  return (
    <div className="min-h-screen bg-[#f2f7e8]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1b4332] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <img src="/medex.png" alt="DoorMed Express" className="h-8 brightness-0 invert" />
            <button 
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* Admin Button - Only show if user is admin */}
            {isAdmin && (
              <a
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition border border-purple-500/30 mb-4"
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin Panel</span>
              </a>
            )}

            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  item.current
                    ? 'bg-[#c9e265] text-[#1b4332]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
            
            {/* Shop Link - Highlighted */}
            <a
              href={shopLink.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#c9e265]/20 text-[#c9e265] hover:bg-[#c9e265]/30 transition border border-[#c9e265]/30"
            >
              <shopLink.icon className="h-5 w-5" />
              <span className="font-medium">{shopLink.name}</span>
            </a>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <a href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition mb-2">
              <User className="h-5 w-5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                </div>
                <div className="text-xs text-white/50">View Profile</div>
              </div>
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden text-gray-600"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-serif italic text-[#1b4332]">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user ? user.firstName : 'Loading...'}!
                </p>
              </div>
            </div>
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-[#1b4332]">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Delivery Card */}
              {nextDelivery ? (
                <div className="bg-gradient-to-br from-[#1b4332] to-[#2d5a45] rounded-2xl p-8 text-white">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-serif italic mb-2">Next Delivery</h2>
                      <p className="text-white/70">Your medications are on the way</p>
                    </div>
                    {dashboardData.stats.daysUntilDelivery !== null && (
                      <div className="bg-[#c9e265] text-[#1b4332] px-4 py-2 rounded-full text-sm font-medium">
                        {dashboardData.stats.daysUntilDelivery} days left
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Delivery Date</p>
                      <p className="text-xl font-semibold">
                        {new Date(nextDelivery.estimatedDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Items</p>
                      <p className="text-xl font-semibold">{nextDelivery.order.items.length} medications</p>
                    </div>
                  </div>
                  <button className="mt-6 bg-[#c9e265] text-[#1b4332] px-6 py-3 rounded-full font-medium hover:bg-[#d4e857] transition">
                    Track Delivery
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-serif italic text-gray-700 mb-2">No Active Deliveries</h2>
                  <p className="text-gray-600 mb-4">You don&apos;t have any deliveries scheduled</p>
                  <a 
                    href="/shop" 
                    className="inline-block bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-full font-medium hover:bg-[#143528] transition"
                  >
                    Shop Medications
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Medications */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif italic text-[#1b4332]">Today&apos;s Medications</h2>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  {todaysMedications.length > 0 ? (
                    <div className="space-y-4">
                      {todaysMedications.slice(0, 3).map((userMed: any) => (
                        <div key={userMed.id} className="flex items-start gap-4 p-4 bg-[#f2f7e8] rounded-xl">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-100">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#1b4332]">{userMed.medication.name}</h3>
                            <p className="text-sm text-gray-600">{userMed.time[0]} • {userMed.instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No medications added yet</p>
                      <a 
                        href="/shop" 
                        className="text-[#1b4332] font-medium hover:underline"
                      >
                        Browse Medications
                      </a>
                    </div>
                  )}
                </div>

                {/* Active Subscriptions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif italic text-[#1b4332]">Active Subscriptions</h2>
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  {activeSubscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {activeSubscriptions.map((sub: any) => (
                        <div key={sub.id} className="p-4 bg-[#f2f7e8] rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-[#1b4332]">{sub.name}</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Next refill: {new Date(sub.nextDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {sub.items.length} items
                          </p>
                          <button className="text-sm text-[#1b4332] font-medium hover:underline">
                            Manage Subscription
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No active subscriptions</p>
                      <a 
                        href="/shop" 
                        className="text-[#1b4332] font-medium hover:underline"
                      >
                        Create Subscription
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
