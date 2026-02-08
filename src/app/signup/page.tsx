'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function SignUp() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({
    confirmPassword: '',
    email: ''
  })
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          router.push('/dashboard')
        }
      } catch (error) {
        // User not logged in, stay on signup page
      }
    }
    checkAuth()
  }, [router])

  // Check email availability with debounce
  useEffect(() => {
    if (!formData.email || formData.email.length < 3) {
      setEmailStatus('idle')
      return
    }

    const timeoutId = setTimeout(async () => {
      setEmailStatus('checking')
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        })
        const data = await response.json()
        setEmailStatus(data.available ? 'available' : 'taken')
        if (!data.available) {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }))
        } else {
          setErrors(prev => ({ ...prev, email: '' }))
        }
      } catch (error) {
        setEmailStatus('idle')
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [formData.email])

  // Validate confirm password when user leaves the field
  const handleConfirmPasswordBlur = () => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      return
    }

    // Check if email is available
    if (emailStatus === 'taken') {
      setErrors(prev => ({ ...prev, email: 'Email already exists' }))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to onboarding
        window.location.href = '/onboarding'
      } else {
        // Show error
        if (data.error) {
          if (data.error.includes('email')) {
            setErrors(prev => ({ ...prev, email: data.error }))
          } else {
            alert(data.error)
          }
        }
      }
    } catch (error) {
      alert('Failed to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
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
            <h1 className="text-4xl font-serif italic text-[#1b4332] mb-2">Create Account</h1>
            <p className="text-gray-600">Start your hassle-free medication journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="John"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Doe"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value})
                    setErrors(prev => ({ ...prev, email: '' }))
                  }}
                  placeholder="your.email@example.com"
                  required
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    emailStatus === 'available' 
                      ? 'border-green-500 focus:ring-green-500' 
                      : emailStatus === 'taken'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-[#1b4332]'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {emailStatus === 'checking' && (
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  )}
                  {emailStatus === 'available' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {emailStatus === 'taken' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {emailStatus === 'available' && (
                <p className="mt-1 text-sm text-green-600">✓ Email Available</p>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Create a strong password"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({...formData, confirmPassword: e.target.value})
                    setErrors(prev => ({ ...prev, confirmPassword: '' }))
                  }}
                  onBlur={handleConfirmPasswordBlur}
                  placeholder="Confirm your password"
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-[#1b4332]'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                required
                className="w-4 h-4 text-[#1b4332] rounded mt-1"
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="/terms" className="text-[#1b4332] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[#1b4332] hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || emailStatus === 'taken' || emailStatus === 'checking'}
              className="w-full flex items-center justify-center gap-3 bg-[#1b4332] text-[#c9e265] px-6 py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-lg">Creating Account...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-[#1b4332] font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1b4332] to-[#2d5a45] p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <h2 className="text-4xl font-serif italic mb-6">Join Thousands of Happy Customers</h2>
          <p className="text-white/80 text-lg mb-8">
            Experience the convenience of automated medication delivery and never worry about running out again.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-[#c9e265] rounded-full border-2 border-white"></div>
                <div className="w-10 h-10 bg-[#d4e857] rounded-full border-2 border-white"></div>
                <div className="w-10 h-10 bg-[#c9e265] rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="flex text-[#c9e265] mb-1">★★★★★</div>
                <p className="text-sm text-white/70">Rated 4.9/5 by 10,000+ users</p>
              </div>
            </div>
            <p className="text-white/90 italic">
              &quot;DoorMedExpress has completely changed how I manage my medications. I never forget to refill anymore!&quot;
            </p>
            <p className="text-white/70 text-sm mt-2">- Sarah M., Verified Customer</p>
          </div>
        </div>
      </div>
    </div>
  )
}
