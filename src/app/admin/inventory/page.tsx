'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Medication {
  id: string
  name: string
  dosage: string
  category: string
  price: number
  description: string
  stockQuantity: number
  lowStockThreshold: number
  sku: string
  manufacturer: string
  requiresPrescription: boolean
  inStock: boolean
  image?: string
}

export default function InventoryManagement() {
  const router = useRouter()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    category: '',
    price: 0,
    description: '',
    sku: '',
    manufacturer: '',
    stockQuantity: 0,
    lowStockThreshold: 10,
    requiresPrescription: false,
    image: ''
  })

  useEffect(() => {
    checkAdminAuth()
    fetchInventory()
    // Removed auto-refresh for better performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      if (!response.ok) {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/inventory')
      if (response.ok) {
        const data = await response.json()
        setMedications(data.medications)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (id: string, newQuantity: number) => {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stockQuantity: newQuantity })
      })
      
      if (response.ok) {
        fetchInventory()
      }
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const handleEdit = (med: Medication) => {
    setEditingMed(med)
    setFormData({
      name: med.name,
      dosage: med.dosage,
      category: med.category,
      price: med.price,
      description: med.description,
      sku: med.sku,
      manufacturer: med.manufacturer,
      stockQuantity: med.stockQuantity,
      lowStockThreshold: med.lowStockThreshold,
      requiresPrescription: med.requiresPrescription,
      image: med.image || ''
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingMed) return

    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingMed.id, ...formData })
      })

      if (response.ok) {
        setEditingMed(null)
        fetchInventory()
        alert('Medication updated successfully!')
      } else {
        alert('Failed to update medication')
      }
    } catch (error) {
      console.error('Failed to update medication:', error)
      alert('Failed to update medication')
    }
  }

  const handleAddNew = () => {
    setShowAddModal(true)
    setFormData({
      name: '',
      dosage: '',
      category: '',
      price: 0,
      description: '',
      sku: '',
      manufacturer: '',
      stockQuantity: 0,
      lowStockThreshold: 10,
      requiresPrescription: false,
      image: ''
    })
  }

  const handleSaveNew = async () => {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowAddModal(false)
        fetchInventory()
        alert('Medication added successfully!')
      } else {
        alert('Failed to add medication')
      }
    } catch (error) {
      console.error('Failed to add medication:', error)
      alert('Failed to add medication')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return
    
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      if (response.ok) {
        fetchInventory()
      }
    } catch (error) {
      console.error('Failed to delete medication:', error)
    }
  }

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || med.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(medications.map(m => m.category)))]
  const lowStockItems = medications.filter(m => m.stockQuantity <= m.lowStockThreshold)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif italic text-[#1b4332]">Inventory Management</h1>
            <p className="text-gray-600 mt-2">Manage your medication stock levels</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
          >
            <Plus className="h-5 w-5" />
            Add Medication
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Low Stock Alert</p>
              <p className="text-sm text-red-700 mt-1">
                {lowStockItems.length} item(s) are running low on stock
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1b4332]"></div>
              <p className="text-gray-600 mt-4">Loading inventory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f2f7e8]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">SKU</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#1b4332]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMedications.map((med) => {
                    const isLowStock = med.stockQuantity <= med.lowStockThreshold
                    return (
                      <tr key={med.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{med.sku}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-600">{med.dosage}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{med.category}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₱{med.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{med.stockQuantity}</span>
                        </td>
                        <td className="px-6 py-4">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(med)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit medication"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(med.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete medication"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-[#1b4332] mt-1">{medications.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{lowStockItems.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Total Stock Value</p>
            <p className="text-2xl font-bold text-[#1b4332] mt-1">
              ₱{medications.reduce((sum, m) => sum + (m.price * m.stockQuantity), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-[#1b4332] mt-1">{categories.length - 1}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMed && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif italic text-[#1b4332]">Edit Medication</h2>
                <button
                  onClick={() => setEditingMed(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                {formData.image && (
                  <div className="mb-3">
                    <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
                {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₱)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
              </div>

              {/* SKU and Manufacturer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              {/* Requires Prescription */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="w-4 h-4 text-[#1b4332] rounded"
                />
                <label className="text-sm font-medium text-gray-700">Requires Prescription</label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingMed(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-[#1b4332] text-[#c9e265] rounded-lg font-medium hover:bg-[#143528] transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif italic text-[#1b4332]">Add New Medication</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                {formData.image && (
                  <div className="mb-3">
                    <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
                {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 500mg, 10ml"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Cardiovascular, Diabetes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  required
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₱) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    required
                  />
                </div>
              </div>

              {/* SKU and Manufacturer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., MED-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer *</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    required
                  />
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              {/* Requires Prescription */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="w-4 h-4 text-[#1b4332] rounded"
                />
                <label className="text-sm font-medium text-gray-700">Requires Prescription</label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNew}
                  className="flex-1 px-4 py-2 bg-[#1b4332] text-[#c9e265] rounded-lg font-medium hover:bg-[#143528] transition"
                >
                  Add Medication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
