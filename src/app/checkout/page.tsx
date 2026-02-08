'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard,
  MapPin,
  CheckCircle2,
  Lock,
  Plus,
  AlertCircle
} from 'lucide-react'
import { formatPHP } from '@/lib/currency'

interface CartItem {
  id: string
  name: string
  dosage: string
  price: number
  quantity: number
  image?: string
  category: string
  requiresPrescription: boolean
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

export default function Checkout() {
  const [step, setStep] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'gcash' | 'cod'>('credit_card')
  const [gcashData, setGcashData] = useState({
    phoneNumber: '',
    accountName: ''
  })
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [isSubscription, setIsSubscription] = useState(false)

  useEffect(() => {
    // Load cart from localStorage
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(cartData)
    
    // Check if cart contains subscription items
    const hasSubscription = cartData.some((item: any) => item.type === 'subscription')
    setIsSubscription(hasSubscription)
    
    // If subscription, force credit card payment
    if (hasSubscription) {
      setPaymentMethod('credit_card')
    }
    
    // Fetch user data and addresses
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

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.12 // 12% VAT
    const shipping = 0 // Free shipping
    const total = subtotal + tax + shipping
    return { subtotal, tax, shipping, total }
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    // Validate payment method
    if (paymentMethod === 'credit_card') {
      if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
        setPaymentError('Please fill in all credit card details')
        return
      }
    } else if (paymentMethod === 'gcash') {
      if (!gcashData.phoneNumber || !gcashData.accountName) {
        setPaymentError('Please fill in all GCash details')
        return
      }
    }

    // Check if any items require prescription
    const requiresPrescription = cart.some(item => item.requiresPrescription)
    if (requiresPrescription) {
      const confirmed = confirm('Some items require a prescription. You will need to upload your prescription after placing the order. Continue?')
      if (!confirmed) return
    }

    setLoading(true)
    setPaymentProcessing(true)
    setPaymentError('')

    try {
      // Calculate total
      const { total } = calculateTotals()

      // Mock payment processing (simulate delay)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create order
      const orderResponse = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            medicationId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          addressId: selectedAddress, // Add the selected address ID
          paymentMethod: paymentMethod,
          paymentDetails: paymentMethod === 'credit_card' 
            ? { last4: paymentData.cardNumber.slice(-4), cardName: paymentData.cardName }
            : paymentMethod === 'gcash'
            ? { phoneNumber: gcashData.phoneNumber, accountName: gcashData.accountName }
            : { method: 'Cash on Delivery' },
          totalAmount: total,
        })
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const orderData = await orderResponse.json()
      const orderId = orderData.order.id

      // Mock payment success
      // In production, this would be replaced with actual Xendit integration
      
      // Clear cart and redirect
      localStorage.removeItem('cart')
      window.location.href = `/order-confirmation?orderId=${orderId}&paymentMethod=${paymentMethod}`
    } catch (error: any) {
      console.error('Checkout error:', error)
      setPaymentError(error.message || 'Failed to complete checkout. Please try again.')
    } finally {
      setLoading(false)
      setPaymentProcessing(false)
    }
  }

  const { subtotal, tax, shipping, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-[#f2f7e8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img src="/medex.png" alt="DoorMed Express" className="h-10" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${s <= step ? 'text-[#1b4332]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    s < step ? 'bg-green-500 text-white' :
                    s === step ? 'bg-[#1b4332] text-[#c9e265]' :
                    'bg-gray-200'
                  }`}>
                    {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  <span className="hidden md:inline font-medium">
                    {s === 1 ? 'Delivery' : s === 2 ? 'Payment' : 'Review'}
                  </span>
                </div>
                {s < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
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
                        <p className="text-sm text-yellow-700">Please complete your profile with a delivery address in your dashboard.</p>
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

                {showAddAddress && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      Please update your address in your profile settings.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddress}
                  className="w-full mt-6 bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
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

                {isSubscription && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Subscription Payment</p>
                        <p className="text-blue-800">Subscriptions require credit card payment for automatic recurring billing.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method Selection */}
                {!isSubscription && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Credit Card */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('credit_card')}
                        className={`p-4 border-2 rounded-xl text-left transition ${
                          paymentMethod === 'credit_card'
                            ? 'border-[#1b4332] bg-[#f2f7e8]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="h-6 w-6 text-[#1b4332] mb-2" />
                        <p className="font-medium text-gray-900">Credit Card</p>
                        <p className="text-xs text-gray-600 mt-1">Visa, Mastercard, JCB</p>
                      </button>

                      {/* GCash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('gcash')}
                        className={`p-4 border-2 rounded-xl text-left transition ${
                          paymentMethod === 'gcash'
                            ? 'border-[#1b4332] bg-[#f2f7e8]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-6 w-6 bg-blue-600 rounded mb-2 flex items-center justify-center text-white text-xs font-bold">
                          G
                        </div>
                        <p className="font-medium text-gray-900">GCash</p>
                        <p className="text-xs text-gray-600 mt-1">E-wallet payment</p>
                      </button>

                      {/* Cash on Delivery */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-4 border-2 rounded-xl text-left transition ${
                          paymentMethod === 'cod'
                            ? 'border-[#1b4332] bg-[#f2f7e8]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-6 w-6 bg-green-600 rounded mb-2 flex items-center justify-center text-white text-xs font-bold">
                          ₱
                        </div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-xs text-gray-600 mt-1">Pay when you receive</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Credit Card Form */}
                {paymentMethod === 'credit_card' && (
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
                )}

                {/* GCash Form */}
                {paymentMethod === 'gcash' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">GCash Payment</p>
                          <p className="text-blue-800">You will receive a payment request on your GCash app after placing the order.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GCash Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        value={gcashData.phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 11) {
                            setGcashData({ ...gcashData, phoneNumber: value })
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                        maxLength={11}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Name
                      </label>
                      <input
                        type="text"
                        placeholder="Juan Dela Cruz"
                        value={gcashData.accountName}
                        onChange={(e) => setGcashData({ ...gcashData, accountName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Cash on Delivery Info */}
                {paymentMethod === 'cod' && (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 mb-2">Cash on Delivery Selected</p>
                        <p className="text-sm text-green-800 mb-3">
                          Pay with cash when your order is delivered to your doorstep.
                        </p>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Prepare exact amount if possible</li>
                          <li>• Payment is collected upon delivery</li>
                          <li>• Make sure someone is available to receive the order</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    disabled={paymentProcessing}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setPaymentError('')
                      setStep(3)
                    }}
                    disabled={paymentProcessing}
                    className="flex-1 bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-serif italic text-[#1b4332] mb-6">Review Your Order</h2>

                <div className="space-y-6">
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
                      {paymentMethod === 'credit_card' && (
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-[#1b4332]" />
                          <div>
                            <p className="font-medium">Credit Card</p>
                            <p className="text-sm text-gray-600">•••• {paymentData.cardNumber.slice(-4)}</p>
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'gcash' && (
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            G
                          </div>
                          <div>
                            <p className="font-medium">GCash</p>
                            <p className="text-sm text-gray-600">{gcashData.phoneNumber}</p>
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'cod' && (
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            ₱
                          </div>
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-600">Pay when you receive</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-start p-3 bg-[#f2f7e8] rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.dosage} • Qty: {item.quantity}</p>
                            {item.requiresPrescription && (
                              <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                Prescription Required
                              </span>
                            )}
                          </div>
                          <p className="font-medium">{formatPHP(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prescription Warning */}
                  {cart.some(item => item.requiresPrescription) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">Prescription Required</p>
                          <p className="text-blue-800">Some items in your order require a valid prescription. You&apos;ll need to upload it after placing your order.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading || paymentProcessing}
                    className="flex-1 bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading || paymentProcessing ? 'Processing Payment...' : 'Place Order & Pay'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
              <h3 className="text-xl font-serif italic text-[#1b4332] mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {cart.map((item, index) => (
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
