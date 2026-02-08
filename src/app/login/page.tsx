'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          router.push('/dashboard')
        }
      } catch (error) {
        // User not logged in, stay on login page
      }
    }
    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Check onboarding status and redirect accordingly
        const onboardingStep = data.user?.onboardingStep || 0
        
        if (onboardingStep === 0) {
          // Not started onboarding
          window.location.href = '/onboarding'
        } else if (onboardingStep < 4) {
          // Resume onboarding at the step they left off
          window.location.href = `/onboarding?step=${onboardingStep}`
        } else {
          // Onboarding completed, go to dashboard
          window.location.href = '/dashboard'
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f7e8] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <img src="/medex.png" alt="DoorMed Express" className="h-12 mb-4" />
            <h1 className="text-4xl font-serif italic text-[#1b4332] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to manage your medications</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#1b4332] rounded" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-[#1b4332] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#1b4332] text-[#c9e265] px-6 py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-lg">Signing In...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-[#1b4332] font-medium hover:underline">
                Sign up for free
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1b4332] to-[#2d5a45] p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <h2 className="text-4xl font-serif italic mb-6">Your Health, Delivered. Hassle-Free.</h2>
          <p className="text-white/80 text-lg mb-8">
            Never forget to re-purchase your essential medications and supplements again. Automated delivery that ensures you never run out.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#c9e265] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#1b4332] text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Automated Subscriptions</h3>
                <p className="text-white/70 text-sm">Set it once, we handle the rest</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#c9e265] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#1b4332] text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Medication Reminders</h3>
                <p className="text-white/70 text-sm">Never miss a dose with smart alerts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#c9e265] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#1b4332] text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Family Access</h3>
                <p className="text-white/70 text-sm">Keep caregivers informed and connected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
