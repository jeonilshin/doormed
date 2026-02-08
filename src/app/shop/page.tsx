'use client'

import { useState, useEffect } from 'react'
import { 
  Search,
  ShoppingCart,
  User,
  Bell,
  Plus,
  AlertCircle,
  Pill,
  Heart,
  Activity,
  Droplet,
  Shield
} from 'lucide-react'
import { formatPHP } from '@/lib/currency'

interface Medication {
  id: string
  name: string
  dosage: string
  category: string
  price: number
  description: string
  requiresPrescription: boolean
  inStock: boolean
  stockQuantity: number
  image?: string
}

// Category icons mapping
const categoryIcons: Record<string, any> = {
  'Cardiovascular': Heart,
  'Diabetes': Activity,
  'Pain Relief': Shield,
  'Vitamins': Droplet,
  'Antibiotics': Shield,
  'Supplements': Pill,
}

// Category colors
const categoryColors: Record<string, string> = {
  'Cardiovascular': 'from-red-100 to-red-200',
  'Diabetes': 'from-blue-100 to-blue-200',
  'Pain Relief': 'from-green-100 to-green-200',
  'Vitamins': 'from-yellow-100 to-yellow-200',
  'Antibiotics': 'from-purple-100 to-purple-200',
  'Supplements': 'from-orange-100 to-orange-200',
}

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cartCount, setCartCount] = useState(0)
  const [products, setProducts] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Medication | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchProducts()
    fetchUser()
    // Load cart count from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartCount(cart.length)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/medications')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.medications)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Products' },
    ...Array.from(new Set(products.map(p => p.category))).map(cat => ({
      id: cat.toLowerCase().replace(/\s+/g, '-'),
      name: cat
    }))
  ]

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
                           product.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (productId: string) => {
    // Check if user is logged in
    if (!user) {
      alert('Please log in to add items to cart')
      window.location.href = '/login'
      return
    }

    // Check if email is verified
    if (!user.emailVerified) {
      alert('Please verify your email before adding items to cart. Check your inbox for the verification link.')
      return
    }

    const product = products.find(p => p.id === productId)
    if (!product) return

    // Get existing cart
    const savedCart = localStorage.getItem('cart')
    const cart = savedCart ? JSON.parse(savedCart) : []
    
    // Check if product already in cart
    const existingItem = cart.find((item: any) => item.id === productId)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartCount(cart.length)
    
    // Show success message
    alert(`${product.name} added to cart!`)
  }

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Pill
    return Icon
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'from-gray-100 to-gray-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7e8] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a href="/">
                <img src="/medex.png" alt="DoorMed Express" className="h-8 sm:h-10" />
              </a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/shop" className="text-[#1b4332] font-semibold border-b-2 border-[#1b4332] pb-1">Shop</a>
                <a href="/shop/packages" className="text-gray-600 hover:text-[#1b4332] font-medium transition">Packages</a>
                <a href="/dashboard" className="text-gray-600 hover:text-[#1b4332] font-medium transition">Dashboard</a>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Bell className="h-5 w-5" />
              </button>
              <a href="/cart" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1b4332] text-[#c9e265] text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </a>
              <a href="/dashboard/profile" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <User className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b4332] via-[#2d5a45] to-[#1b4332]"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#c9e265] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#c9e265] rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-white mb-4">
              Your Health, Delivered
            </h1>
            <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
              Browse our complete selection of medications and supplements. Automatic refills, doorstep delivery.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for medications..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-[#c9e265]/50 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Browse by Category</h2>
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 category-scroll">
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 px-6 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#1b4332] text-[#c9e265] shadow-md'
                        : 'bg-white text-gray-700 hover:bg-[#f2f7e8] border border-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-[#1b4332]">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1b4332] mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const CategoryIcon = getCategoryIcon(product.category)
              const categoryColor = getCategoryColor(product.category)
              
              return (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#1b4332] hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  {/* Product Image/Icon */}
                  <div className={`relative h-44 bg-gradient-to-br ${categoryColor} flex items-center justify-center overflow-hidden`}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                        <CategoryIcon className="h-16 w-16 mx-auto mb-2 text-gray-700" strokeWidth={1.5} />
                        <span className="inline-block bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                          {product.category}
                        </span>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                        {!product.inStock && (
                          <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg">
                            Out of Stock
                          </span>
                        )}
                        {product.inStock && product.stockQuantity <= 10 && (
                          <span className="bg-yellow-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Low Stock
                          </span>
                        )}
                      </div>
                      {product.requiresPrescription && (
                        <span className="bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg">
                          Rx
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-serif italic text-[#1b4332] mb-1 line-clamp-1 group-hover:text-[#2d5a45] transition">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.dosage}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{product.description}</p>
                    
                    {/* Price and Action */}
                    <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-[#1b4332]">{formatPHP(product.price)}</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(product.id)
                        }}
                        disabled={!product.inStock}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium transition-all ${
                          product.inStock
                            ? 'bg-[#1b4332] text-[#c9e265] hover:bg-[#143528] hover:shadow-lg hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">Add</span>
                      </button>
                    </div>
                    
                    {/* Stock Info */}
                    {product.inStock && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {product.stockQuantity} available
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter to find what you&apos;re looking for.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
              {/* Left: Product Image */}
              <div className="relative">
                <div className={`relative h-80 bg-gradient-to-br ${getCategoryColor(selectedProduct.category)} rounded-2xl flex items-center justify-center overflow-hidden`}>
                  {selectedProduct.image ? (
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      {(() => {
                        const Icon = getCategoryIcon(selectedProduct.category)
                        return <Icon className="h-32 w-32 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                      })()}
                      <span className="inline-block bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700">
                        {selectedProduct.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      {!selectedProduct.inStock && (
                        <span className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                          Out of Stock
                        </span>
                      )}
                      {selectedProduct.inStock && selectedProduct.stockQuantity <= 10 && (
                        <span className="bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Low Stock
                        </span>
                      )}
                    </div>
                    {selectedProduct.requiresPrescription && (
                      <span className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                        Prescription Required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Product Details */}
              <div className="flex flex-col">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="self-end text-gray-400 hover:text-gray-600 transition mb-4"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Product Info */}
                <div className="flex-1">
                  <div className="mb-4">
                    <span className="inline-block bg-[#f2f7e8] text-[#1b4332] text-xs px-3 py-1 rounded-full font-medium mb-3">
                      {selectedProduct.category}
                    </span>
                    <h2 className="text-3xl font-serif italic text-[#1b4332] mb-2">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-gray-600 font-medium">{selectedProduct.dosage}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Stock Status</p>
                      <p className={`text-sm font-semibold ${selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.inStock ? `${selectedProduct.stockQuantity} Available` : 'Out of Stock'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Prescription</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedProduct.requiresPrescription ? 'Required' : 'Not Required'}
                      </p>
                    </div>
                  </div>

                  {/* Price and Add to Cart */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Price per month</p>
                        <p className="text-4xl font-bold text-[#1b4332]">{formatPHP(selectedProduct.price)}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(selectedProduct.id)
                        setSelectedProduct(null)
                      }}
                      disabled={!selectedProduct.inStock}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                        selectedProduct.inStock
                          ? 'bg-[#1b4332] text-[#c9e265] hover:bg-[#143528] hover:shadow-lg hover:scale-105'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {selectedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                    {selectedProduct.requiresPrescription && selectedProduct.inStock && (
                      <p className="text-xs text-blue-600 mt-3 text-center flex items-center justify-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        You&apos;ll need to upload a prescription during checkout
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-[#1b4332] to-[#2d5a45] text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif italic mb-3">Need help finding the right medication?</h2>
          <p className="text-white/80 mb-6">Our support team is here to assist you</p>
          <a
            href="/dashboard/support"
            className="inline-block bg-[#c9e265] text-[#1b4332] px-8 py-3 rounded-xl font-semibold hover:bg-[#d4ed70] transition shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .category-scroll {
          scrollbar-width: thin;
          scrollbar-color: #1b4332 #f2f7e8;
        }
        
        .category-scroll::-webkit-scrollbar {
          height: 6px;
        }
        
        .category-scroll::-webkit-scrollbar-track {
          background: #f2f7e8;
          border-radius: 10px;
        }
        
        .category-scroll::-webkit-scrollbar-thumb {
          background: #1b4332;
          border-radius: 10px;
        }
        
        .category-scroll::-webkit-scrollbar-thumb:hover {
          background: #143528;
        }
      `}</style>
    </div>
  )
}
