'use client'

import { AlertCircle, Mail, X } from 'lucide-react'
import { useState } from 'react'

interface VerificationBannerProps {
  email: string
  onResend: () => void
}

export default function VerificationBanner({ email, onResend }: VerificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    await onResend()
    setTimeout(() => setIsResending(false), 2000)
  }

  if (!isVisible) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Please verify your email address to subscribe or purchase medications
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                We sent a verification link to <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="flex items-center gap-1.5 text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {isResending ? 'Sending...' : 'Resend Email'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-yellow-600 hover:text-yellow-800 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
