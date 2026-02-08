'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Plus,
  Search,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Pause,
  Play,
  AlertCircle,
  Pill
} from 'lucide-react'

export default function Medications() {
  const [searchQuery, setSearchQuery] = useState('')
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/user/medications')
      if (response.ok) {
        const data = await response.json()
        setMedications(data.medications)
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedications = medications.filter(userMed =>
    userMed.medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userMed.medication.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout 
      currentPage="/dashboard/medications" 
      title="My Medications"
      subtitle="Manage your prescriptions and supplements"
    >
      <div className="space-y-6">
        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medications..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition">
            <Plus className="h-5 w-5" />
            Add Medication
          </button>
        </div>

        {/* Medications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading medications...</p>
          </div>
        ) : filteredMedications.length > 0 ? (
          <div className="grid gap-4">
            {filteredMedications.map((userMed) => (
              <div key={userMed.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-serif italic text-[#1b4332]">{userMed.medication.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        userMed.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {userMed.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{userMed.dosage} • {userMed.frequency}</p>
                    <p className="text-sm text-gray-500">{userMed.medication.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition">
                      {userMed.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 p-4 bg-[#f2f7e8] rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#1b4332]" />
                    <div>
                      <p className="text-xs text-gray-600">Schedule</p>
                      <p className="font-medium text-gray-900">{userMed.time.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#1b4332]" />
                    <div>
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="font-medium text-gray-900">₱{userMed.medication.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-[#1b4332]" />
                    <div>
                      <p className="text-xs text-gray-600">Adherence</p>
                      <p className="font-medium text-gray-900">{userMed.adherence}%</p>
                    </div>
                  </div>
                </div>

                {userMed.instruction && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Instructions:</strong> {userMed.instruction}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No medications found' : 'No medications added yet'}
            </p>
            <a 
              href="/shop" 
              className="inline-block bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
            >
              Browse Medications
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
