'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag
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
  type?: 'subscription' | 'regular' // Add type to distinguish
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartItems(cart.map((item: any) => ({
        ...item,
        type: item.type || 'regular' // Default to regular if not specified
      })))
    }
    setLoading(false)
  }

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items))
    setCartItems(items)
  }

  const updateQuantity = (id: string, change: number) => {
    const updatedCart = cartItems.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    )
    saveCart(updatedCart)
  }

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    saveCart(updatedCart)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.12 // 12% VAT in Philippines
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-[#f2f7e8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img src="/medex.png" alt="DoorMed Express" className="h-10" />
            <a href="/shop" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif italic text-[#1b4332] mb-8">Shopping Cart</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1b4332] mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-serif italic text-gray-600 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add some medications to get started</p>
                <a 
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl hover:bg-[#143528] transition font-medium"
                >
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex gap-6">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-serif italic text-[#1b4332]">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.dosage}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                          {item.requiresPrescription && (
                            <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                              Prescription Required
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <label className="text-sm text-gray-600 block mb-2">Quantity</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {formatPHP(item.price)} × {item.quantity}
                        </p>
                        <p className="text-xl font-bold text-[#1b4332]">
                          {formatPHP(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-6">
              <h2 className="text-xl font-serif italic text-[#1b4332] mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPHP(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>VAT (12%)</span>
                  <span>{formatPHP(tax)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xl font-bold text-[#1b4332] mb-6">
                <span>Total</span>
                <span>{formatPHP(total)}</span>
              </div>

              <a
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-[#1b4332] text-[#c9e265] px-6 py-4 rounded-xl hover:bg-[#143528] transition font-medium"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </a>

              <div className="mt-6 p-4 bg-[#f2f7e8] rounded-xl">
                <div className="flex items-start gap-2">
                  <Tag className="h-5 w-5 text-[#1b4332] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Save with subscriptions</p>
                    <p className="text-gray-600">Get 10% off when you subscribe to automatic deliveries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </main>
    </div>
  )
}
