'use client'

import { useState, useEffect } from 'react'
import { Package, Check, ShoppingCart } from 'lucide-react'

export default function Packages() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (pkg: any) => {
    // Clear cart and add only this subscription
    const subscriptionItem = {
      type: 'subscription',
      packageId: pkg.id,
      name: pkg.name,
      price: pkg.price,
      frequency: pkg.frequency,
      items: pkg.items.map((item: any) => ({
        medicationId: item.medication.id,
        name: item.medication.name,
        quantity: item.quantity,
        price: item.medication.price
      }))
    }
    
    // Store subscription in cart
    localStorage.setItem('cart', JSON.stringify([subscriptionItem]))
    
    // Redirect to subscription checkout
    window.location.href = '/checkout/subscription'
  }

  return (
    <div className="min-h-screen bg-[#f2f7e8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif italic text-[#1b4332]">Subscription Packages</h1>
              <p className="text-gray-600 mt-1">Save with our pre-made medication bundles</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/shop"
                className="text-[#1b4332] hover:text-[#143528] font-medium"
              >
                ← Back to Shop
              </a>
              <a
                href="/cart"
                className="flex items-center gap-2 bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
              >
                <ShoppingCart className="h-5 w-5" />
                Cart
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading packages...</p>
          </div>
        ) : packages.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#1b4332] transition"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-[#1b4332] to-[#2d5a45] p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="h-8 w-8" />
                    <h3 className="text-2xl font-serif italic">{pkg.name}</h3>
                  </div>
                  <p className="text-white/80 text-sm">{pkg.description}</p>
                </div>

                {/* Price */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#1b4332]">
                      ₱{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Delivered every {pkg.frequency} days
                  </p>
                </div>

                {/* Items */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Includes:</h4>
                  <ul className="space-y-3">
                    {pkg.items.map((item: any, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-900 font-medium">
                            {item.medication.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} units • ₱{item.medication.price.toLocaleString()} each
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subscribe Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => addToCart(pkg)}
                    className="w-full bg-[#1b4332] text-[#c9e265] py-4 rounded-xl font-medium hover:bg-[#143528] transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Subscribe Now
                  </button>
                </div>

                {/* Benefits */}
                <div className="px-6 pb-6">
                  <div className="bg-[#f2f7e8] rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Benefits:</strong> Automatic refills, never run out, save on delivery
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No packages available</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-serif italic text-[#1b4332] mb-4">
            How Subscriptions Work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#1b4332] text-[#c9e265] flex items-center justify-center mb-3">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Choose Your Package</h3>
              <p className="text-sm text-gray-600">
                Select a package that matches your health needs
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-[#1b4332] text-[#c9e265] flex items-center justify-center mb-3">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Automatic Delivery</h3>
              <p className="text-sm text-gray-600">
                Receive your medications every month automatically
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-[#1b4332] text-[#c9e265] flex items-center justify-center mb-3">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Manage Anytime</h3>
              <p className="text-sm text-gray-600">
                Pause, modify, or cancel your subscription anytime
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
