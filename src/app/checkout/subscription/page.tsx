'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard,
  MapPin,
  CheckCircle2,
  Lock,
  Plus,
  AlertCircle,
  Calendar,
  Package
} from 'lucide-react'
import { formatPHP } from '@/lib/currency'

interface SubscriptionItem {
  type: 'subscription'
  packageId: string
  name: string
  price: number
  frequency: number
  items: Array<{
    medicationId: string
    name: string
    quantity: number
    price: number
  }>
}

interface Address {
  id: string
  street: string
  barangay: string
  city: string
  province: string
  zipCode: string
  isDefault: boolean
}

type PlanType = 'one_time' | 'monthly' | 'semi_annual' | 'annual'

export default function SubscriptionCheckout() {
  const [step, setStep] = useState(1)
  const [subscription, setSubscription] = useState<SubscriptionItem | null>(null)
  const [planType, setPlanType] = useState<PlanType>('monthly')
  const [preferredDay, setPreferredDay] = useState(15)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    // Load subscription from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const subscriptionItem = cart.find((item: any) => item.type === 'subscription')
    
    if (!subscriptionItem) {
      alert('No subscription found in cart')
      window.location.href = '/shop/packages'
      return
    }
    
    setSubscription(subscriptionItem)
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // Fetch addresses
        const profileResponse = await fetch('/api/user/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          // Check for addresses array from Address table
          if (profileData.profile?.addresses && profileData.profile.addresses.length > 0) {
            setAddresses(profileData.profile.addresses)
            // Set first address or default address as selected
            const defaultAddr = profileData.profile.addresses.find((a: any) => a.isDefault)
            setSelectedAddress(defaultAddr?.id || profileData.profile.addresses[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const getPlanDetails = () => {
    const plans = {
      one_time: { name: 'One-Time Trial', frequency: 0, discount: 0 },
      monthly: { name: '30 Days Monthly', frequency: 30, discount: 0 },
      semi_annual: { name: 'Semi-Annual (6 months)', frequency: 180, discount: 0.10 },
      annual: { name: 'Annual (12 months)', frequency: 365, discount: 0.15 }
    }
    return plans[planType]
  }

  const calculateTotals = () => {
    if (!subscription) return { subtotal: 0, tax: 0, shipping: 0, total: 0, discount: 0 }
    
    const plan = getPlanDetails()
    const subtotal = subscription.price
    const discount = subtotal * plan.discount
    const discountedSubtotal = subtotal - discount
    const tax = discountedSubtotal * 0.12 // 12% VAT
    const shipping = 0 // Free shipping
    const total = discountedSubtotal + tax + shipping
    
    return { subtotal, tax, shipping, total, discount }
  }

  const handleSubscribe = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
      setPaymentError('Please fill in all credit card details')
      return
    }

    setLoading(true)
    setPaymentProcessing(true)
    setPaymentError('')

    try {
      const { total } = calculateTotals()
      const plan = getPlanDetails()

      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create subscription
      const response = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: subscription?.packageId,
          planType,
          frequency: plan.frequency,
          preferredDay: planType === 'monthly' ? preferredDay : null,
          addressId: selectedAddress,
          paymentDetails: {
            last4: paymentData.cardNumber.slice(-4),
            cardName: paymentData.cardName
          },
          totalAmount: total,
          items: subscription?.items
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }

      const data = await response.json()
      
      // Clear cart and redirect
      localStorage.removeItem('cart')
      window.location.href = `/order-confirmation?subscriptionId=${data.subscription.id}&type=subscription`
    } catch (error: any) {
      console.error('Subscription error:', error)
      setPaymentError(error.message || 'Failed to create subscription. Please try again.')
    } finally {
      setLoading(false)
      setPaymentProcessing(false)
    }
  }

  const { subtotal, tax, shipping, total, discount } = calculateTotals()

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#f2f7e8] flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f7e8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img src="/medex.png" alt="DoorMed Express" className="h-10" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              Secure Subscription Checkout
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${s <= step ? 'text-[#1b4332]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    s < step ? 'bg-green-500 text-white' :
                    s === step ? 'bg-[#1b4332] text-[#c9e265]' :
                    'bg-gray-200'
                  }`}>
                    {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  <span className="hidden md:inline font-medium text-sm">
                    {s === 1 ? 'Plan' : s === 2 ? 'Delivery' : s === 3 ? 'Payment' : 'Review'}
                  </span>
                </div>
                {s < 4 && <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Choose Plan */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="h-6 w-6 text-[#1b4332]" />
                  <h2 className="text-2xl font-serif italic text-[#1b4332]">Choose Your Plan</h2>
                </div>

                <div className="space-y-4">
                  {/* One-Time Trial */}
                  <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition ${
                      planType === 'one_time'
                        ? 'border-[#1b4332] bg-[#f2f7e8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value="one_time"
                      checked={planType === 'one_time'}
                      onChange={(e) => setPlanType(e.target.value as PlanType)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">One-Time Trial</span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">Try it first</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6 mt-1">
                        Single delivery • No commitment • {formatPHP(subscription.price)}
                      </p>
                    </div>
                  </label>

                  {/* Monthly */}
                  <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition ${
                      planType === 'monthly'
                        ? 'border-[#1b4332] bg-[#f2f7e8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value="monthly"
                      checked={planType === 'monthly'}
                      onChange={(e) => setPlanType(e.target.value as PlanType)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">30 Days Monthly</span>
                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Most Popular</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6 mt-1">
                        Delivered every 30 days • {formatPHP(subscription.price)}/month
                      </p>
                    </div>
                  </label>

                  {/* Semi-Annual */}
                  <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition ${
                      planType === 'semi_annual'
                        ? 'border-[#1b4332] bg-[#f2f7e8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value="semi_annual"
                      checked={planType === 'semi_annual'}
                      onChange={(e) => setPlanType(e.target.value as PlanType)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">Semi-Annual (6 months)</span>
                        <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">Save 10%</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6 mt-1">
                        Delivered every 6 months • {formatPHP(subscription.price * 0.9)}/delivery
                      </p>
                    </div>
                  </label>

                  {/* Annual */}
                  <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition ${
                      planType === 'annual'
                        ? 'border-[#1b4332] bg-[#f2f7e8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value="annual"
                      checked={planType === 'annual'}
                      onChange={(e) => setPlanType(e.target.value as PlanType)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">Annual (12 months)</span>
                        <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Save 15%</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6 mt-1">
                        Delivered every 12 months • {formatPHP(subscription.price * 0.85)}/delivery
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preferred Delivery Day (for monthly) */}
                {planType === 'monthly' && (
                  <div className="mt-6 p-6 bg-[#f2f7e8] rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="h-5 w-5 text-[#1b4332]" />
                      <h3 className="font-medium text-gray-900">Preferred Delivery Day</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose which day of the month you&apos;d like to receive your delivery
                    </p>
                    <select
                      value={preferredDay}
                      onChange={(e) => setPreferredDay(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          Day {day} of each month
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition"
                >
                  Continue to Delivery Address
                </button>
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-6 w-6 text-[#1b4332]" />
                  <h2 className="text-2xl font-serif italic text-[#1b4332]">Delivery Address</h2>
                </div>

                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition ${
                          selectedAddress === addr.id
                            ? 'border-[#1b4332] bg-[#f2f7e8]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddress === addr.id}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                          className="mr-3"
                        />
                        <div className="inline-block">
                          <span className="font-medium">{addr.street}</span>
                          <p className="text-sm text-gray-600 ml-6">
                            {addr.barangay && `${addr.barangay}, `}{addr.city}, {addr.province} {addr.zipCode}
                          </p>
                          {addr.isDefault && (
                            <span className="ml-6 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 mb-1">No delivery address found</p>
                        <p className="text-sm text-yellow-700">Please complete your profile with a delivery address.</p>
                        <a 
                          href="/dashboard/profile" 
                          className="inline-block mt-3 text-sm font-medium text-[#1b4332] hover:underline"
                        >
                          Go to Profile →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => window.location.href = '/dashboard/profile'}
                  className="mt-4 flex items-center gap-2 text-[#1b4332] hover:text-[#143528] font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Update Address in Profile
                </button>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedAddress}
                    className="flex-1 bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-6 w-6 text-[#1b4332]" />
                  <h2 className="text-2xl font-serif italic text-[#1b4332]">Payment Method</h2>
                </div>

                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{paymentError}</p>
                    </div>
                  </div>
                )}

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Credit Card Required</p>
                      <p className="text-blue-800">Subscriptions require credit card payment for automatic recurring billing.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-900 mb-1">Demo Mode</p>
                        <p className="text-yellow-800">This is a mock payment. No actual charges will be made. Use any card details for testing.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
                        if (value.replace(/\s/g, '').length <= 16) {
                          setPaymentData({ ...paymentData, cardNumber: value })
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4)
                          }
                          setPaymentData({ ...paymentData, expiryDate: value })
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 4) {
                            setPaymentData({ ...paymentData, cvv: value })
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={paymentProcessing}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setPaymentError('')
                      setStep(4)
                    }}
                    disabled={paymentProcessing}
                    className="flex-1 bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50"
                  >
                    Review Subscription
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-serif italic text-[#1b4332] mb-6">Review Your Subscription</h2>

                <div className="space-y-6">
                  {/* Plan Details */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Subscription Plan</h3>
                    <div className="p-4 bg-[#f2f7e8] rounded-lg">
                      <p className="font-medium">{getPlanDetails().name}</p>
                      <p className="text-sm text-gray-600">
                        {planType === 'one_time' 
                          ? 'Single delivery' 
                          : `Delivered every ${getPlanDetails().frequency} days`}
                      </p>
                      {planType === 'monthly' && (
                        <p className="text-sm text-gray-600 mt-1">
                          Preferred delivery: Day {preferredDay} of each month
                        </p>
                      )}
                      {discount > 0 && (
                        <p className="text-sm text-green-600 mt-1 font-medium">
                          Save {(getPlanDetails().discount * 100).toFixed(0)}% on each delivery!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                    {addresses.find(a => a.id === selectedAddress) && (
                      <div className="p-4 bg-[#f2f7e8] rounded-lg">
                        <p className="font-medium">{addresses.find(a => a.id === selectedAddress)?.street}</p>
                        <p className="text-sm text-gray-600">
                          {addresses.find(a => a.id === selectedAddress)?.barangay && 
                            `${addresses.find(a => a.id === selectedAddress)?.barangay}, `}
                          {addresses.find(a => a.id === selectedAddress)?.city}, {addresses.find(a => a.id === selectedAddress)?.province} {addresses.find(a => a.id === selectedAddress)?.zipCode}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                    <div className="p-4 bg-[#f2f7e8] rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-[#1b4332]" />
                        <div>
                          <p className="font-medium">Credit Card</p>
                          <p className="text-sm text-gray-600">•••• {paymentData.cardNumber.slice(-4)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package Items */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Package Items</h3>
                    <div className="space-y-2">
                      {subscription.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start p-3 bg-[#f2f7e8] rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatPHP(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || paymentProcessing}
                    className="flex-1 bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading || paymentProcessing ? 'Processing...' : 'Confirm Subscription'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
              <h3 className="text-xl font-serif italic text-[#1b4332] mb-4">Subscription Summary</h3>
              
              <div className="mb-4 p-4 bg-[#f2f7e8] rounded-lg">
                <p className="font-medium text-gray-900">{subscription.name}</p>
                <p className="text-sm text-gray-600 mt-1">{getPlanDetails().name}</p>
              </div>

              <div className="space-y-3 mb-6">
                {subscription.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">{formatPHP(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPHP(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount ({(getPlanDetails().discount * 100).toFixed(0)}%)</span>
                    <span className="text-green-600">-{formatPHP(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (12%)</span>
                  <span>{formatPHP(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#1b4332]">{formatPHP(total)}</span>
                </div>
                {planType !== 'one_time' && (
                  <p className="text-xs text-gray-600 mt-2">
                    You will be charged {formatPHP(total)} every {getPlanDetails().frequency} days
                  </p>
                )}
              </div>

              {/* Benefits */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-2">Subscription Benefits:</p>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>✓ Automatic refills</li>
                  <li>✓ Never run out of medication</li>
                  <li>✓ Free delivery</li>
                  <li>✓ Cancel anytime</li>
                  {discount > 0 && <li>✓ Save {(getPlanDetails().discount * 100).toFixed(0)}% on each delivery</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
