'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X } from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData({
          firstName: data.profile.firstName || '',
          lastName: data.profile.lastName || '',
          phone: data.profile.phone || '',
          dateOfBirth: data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : '',
          gender: data.profile.gender || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchProfile()
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      gender: profile.gender || ''
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <DashboardLayout 
        currentPage="/dashboard/profile" 
        title="My Profile"
        subtitle="Manage your account information"
      >
        <div className="text-center py-12">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      currentPage="/dashboard/profile" 
      title="My Profile"
      subtitle="Manage your account information"
    >
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif italic text-[#1b4332]">Personal Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-[#1b4332] hover:text-[#143528] transition"
              >
                <Edit className="h-4 w-4" />
                <span className="font-medium">Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#1b4332] text-[#c9e265] px-4 py-2 rounded-lg hover:bg-[#143528] transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                First Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              ) : (
                <p className="text-gray-900">{profile.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Last Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              ) : (
                <p className="text-gray-900">{profile.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <p className="text-gray-900">{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  placeholder="+63 XXX XXX XXXX"
                />
              ) : (
                <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date of Birth
              </label>
              {editing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.dateOfBirth 
                    ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Not provided'
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              {editing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">{profile.gender || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Health Profile */}
        {profile.healthProfile && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-serif italic text-[#1b4332] mb-6">Health Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.healthProfile.conditions.map((condition: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              {profile.healthProfile.allergies && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <p className="text-gray-900">{profile.healthProfile.allergies}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Addresses */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-serif italic text-[#1b4332] mb-6">Delivery Addresses</h2>
          
          {profile.addresses && profile.addresses.length > 0 ? (
            <div className="space-y-4">
              {profile.addresses.map((address: any) => (
                <div
                  key={address.id}
                  className="p-4 bg-[#f2f7e8] rounded-xl flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#1b4332] mt-0.5" />
                    <div>
                      <p className="text-gray-900">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      {address.isDefault && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No addresses added yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
