'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Plus, Trash2, X, Mail, User as UserIcon } from 'lucide-react'

export default function FamilyAccess() {
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    relationship: '',
    accessLevel: 'view_only'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFamilyMembers()
  }, [])

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch('/api/family/members')
      if (response.ok) {
        const data = await response.json()
        setFamilyMembers(data.familyMembers)
      }
    } catch (error) {
      console.error('Error fetching family members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          email: '',
          name: '',
          relationship: '',
          accessLevel: 'view_only'
        })
        setShowAddForm(false)
        await fetchFamilyMembers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add family member')
      }
    } catch (error) {
      console.error('Error adding family member:', error)
      alert('Failed to add family member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return

    try {
      const response = await fetch(`/api/family/members/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchFamilyMembers()
      }
    } catch (error) {
      console.error('Error deleting family member:', error)
    }
  }

  const handleUpdateAccessLevel = async (id: string, newAccessLevel: string) => {
    try {
      const response = await fetch(`/api/family/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessLevel: newAccessLevel })
      })

      if (response.ok) {
        await fetchFamilyMembers()
      }
    } catch (error) {
      console.error('Error updating access level:', error)
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'view_only':
        return 'bg-blue-100 text-blue-700'
      case 'limited':
        return 'bg-yellow-100 text-yellow-700'
      case 'full_access':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout 
      currentPage="/dashboard/family" 
      title="Family Access"
      subtitle="Share your medication information with trusted family members"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Invite family members to access your medication information. 
            They&apos;ll receive an email invitation and can view your data based on the access level you set.
          </p>
        </div>

        {/* Add Family Member Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
          >
            <Plus className="h-5 w-5" />
            Add Family Member
          </button>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif italic text-[#1b4332]">Add Family Member</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="accessLevel"
                        value="view_only"
                        checked={formData.accessLevel === 'view_only'}
                        onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">View Only</p>
                        <p className="text-sm text-gray-600">Can view medications and delivery schedule</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="accessLevel"
                        value="limited"
                        checked={formData.accessLevel === 'limited'}
                        onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Limited Access</p>
                        <p className="text-sm text-gray-600">Can view and place orders on your behalf</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="accessLevel"
                        value="full_access"
                        checked={formData.accessLevel === 'full_access'}
                        onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Full Access</p>
                        <p className="text-sm text-gray-600">Can manage medications and subscriptions</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-[#1b4332] text-[#c9e265] rounded-lg font-medium hover:bg-[#143528] transition disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Family Members List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading family members...</p>
          </div>
        ) : familyMembers.length > 0 ? (
          <div className="grid gap-4">
            {familyMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#f2f7e8] flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-[#1b4332]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </p>
                        <p>Relationship: {member.relationship}</p>
                      </div>
                      <div className="mt-3">
                        <label className="text-sm text-gray-600 mr-2">Access Level:</label>
                        <select
                          value={member.accessLevel}
                          onChange={(e) => handleUpdateAccessLevel(member.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(member.accessLevel)} border-0 cursor-pointer`}
                        >
                          <option value="view_only">View Only</option>
                          <option value="limited">Limited Access</option>
                          <option value="full_access">Full Access</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No family members added yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition"
            >
              <Plus className="h-5 w-5" />
              Add Your First Family Member
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
