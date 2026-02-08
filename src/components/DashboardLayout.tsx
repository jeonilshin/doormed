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
  LogOut,
  Shield
} from 'lucide-react'
import NotificationBell from './NotificationBell'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
  title: string
  subtitle?: string
}

export default function DashboardLayout({ children, currentPage, title, subtitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAdmin(data.user?.role === 'admin')
        console.log('DashboardLayout - User data:', data.user)
        console.log('DashboardLayout - Is admin:', data.user?.role === 'admin')
      }
    } catch (error) {
      console.error('DashboardLayout - Error fetching user:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Medications', href: '/dashboard/medications', icon: Pill },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Package },
    { name: 'Deliveries', href: '/dashboard/deliveries', icon: Package },
    { name: 'Family Access', href: '/dashboard/family', icon: Users },
    { name: 'Support', href: '/dashboard/support', icon: MessageSquare },
  ]

  const shopLink = { name: 'Shop', href: '/shop', icon: Package }

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear client-side cookie as backup
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      // Force redirect
      window.location.replace('/login')
    }
  }

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

            {navigation.map((item) => {
              const isCurrent = item.href === currentPage
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isCurrent
                      ? 'bg-[#c9e265] text-[#1b4332]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </a>
              )
            })}
            
            {/* Shop Link - Always visible and highlighted */}
            <a
              href={shopLink.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#c9e265]/20 text-[#c9e265] hover:bg-[#c9e265]/30 transition border border-[#c9e265]/30"
            >
              <shopLink.icon className="h-5 w-5" />
              <span className="font-medium">{shopLink.name}</span>
            </a>
          </nav>

          {/* User Profile & Logout */}
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
                <h1 className="text-2xl font-serif italic text-[#1b4332]">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            </div>
            <NotificationBell />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
