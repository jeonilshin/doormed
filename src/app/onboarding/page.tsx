'use client'

import { useState, useEffect, Suspense } from 'react'
import { 
  ArrowRight, 
  ArrowLeft,
  Heart,
  MapPin,
  FileText,
  CheckCircle2,
  Upload,
  AlertCircle,
  Pill
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { philippineProvinces, getCitiesByProvince, getBarangaysByCity } from '@/lib/ph-locations'

function OnboardingContent() {
  const searchParams = useSearchParams()
  const initialStep = parseInt(searchParams.get('step') || '1')
  const [step, setStep] = useState(initialStep)
  const [formData, setFormData] = useState({
    // Step 1: Health Profile
    dateOfBirth: '',
    gender: '',
    conditions: [] as string[],
    otherCondition: '', // For "Other" condition input
    allergies: '',
    
    // Step 2: Delivery Address
    houseNumber: '',
    additionalAddress: '',
    province: '',
    city: '',
    barangay: '',
    zipCode: '',
    phone: '',
    
    // Step 3: Prescription Upload
    prescriptionFile: null as File | null,
    prescriptionNotes: ''
  })

  const [analyzing, setAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [medicationSchedules, setMedicationSchedules] = useState<any[]>([]) // For step 5

  // Cascading dropdown states
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableBarangays, setAvailableBarangays] = useState<string[]>([])

  // Update cities when province changes
  useEffect(() => {
    if (formData.province) {
      const cities = getCitiesByProvince(formData.province)
      setAvailableCities(cities.map(c => c.name))
      setFormData(prev => ({ ...prev, city: '', barangay: '' }))
    } else {
      setAvailableCities([])
    }
  }, [formData.province])

  // Update barangays when city changes
  useEffect(() => {
    if (formData.province && formData.city) {
      const barangays = getBarangaysByCity(formData.province, formData.city)
      setAvailableBarangays(barangays)
      setFormData(prev => ({ ...prev, barangay: '' }))
    } else {
      setAvailableBarangays([])
    }
  }, [formData.city, formData.province])

  const totalSteps = 6 // Added medication schedule step

  const conditions = [
    'Hypertension',
    'High Cholesterol',
    'Diabetes',
    'Heart Disease',
    'Asthma',
    'Arthritis',
    'Other'
  ]

  const handleConditionToggle = (condition: string) => {
    if (formData.conditions.includes(condition)) {
      setFormData({
        ...formData,
        conditions: formData.conditions.filter(c => c !== condition)
      })
    } else {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, condition]
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({...formData, prescriptionFile: e.target.files[0]})
    }
  }

  const handleNext = async () => {
    if (step < totalSteps) {
      // Save data to database at each step
      if (step === 1) {
        await saveHealthProfile()
      } else if (step === 2) {
        await saveAddress()
      } else if (step === 3) {
        await savePrescription()
        // Start analysis after prescription step
        setStep(step + 1)
        await analyzeHealthData()
        return
      } else if (step === 4) {
        // Move to medication schedule customization after analysis
        await loadRecommendations()
      } else if (step === 5) {
        // Save medication schedules before showing final recommendations
        // Schedules are already in medicationSchedules state
      }
      setStep(step + 1)
    } else {
      // Complete onboarding
      await fetch('/api/onboarding/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 6 })
      })
      window.location.href = '/shop'
    }
  }

  const analyzeHealthData = async () => {
    setAnalyzing(true)
    try {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 3000))
      setAnalysisComplete(true)
    } catch (error) {
      console.error('Error analyzing health data:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/onboarding/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
        
        // Initialize medication schedules with recommendations
        const allMeds = [
          ...(data.medications || []),
          ...(data.supplements || [])
        ]
        setMedicationSchedules(allMeds.map((med: any) => ({
          ...med,
          selected: true, // All selected by default
          customDosage: med.dosage,
          customFrequency: med.frequency || 'once daily',
          customTimes: med.times || ['8:00 AM'],
          customInstructions: med.instructions || ''
        })))
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const handleAddToCart = (medicationId: string) => {
    // Add medication to cart
    const medication = recommendations?.medications?.find((m: any) => m.id === medicationId) ||
                      recommendations?.supplements?.find((s: any) => s.id === medicationId)
    
    if (!medication) return

    const savedCart = localStorage.getItem('cart')
    const cart = savedCart ? JSON.parse(savedCart) : []
    
    // Check if already in cart
    const existingItem = cart.find((item: any) => item.id === medicationId)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...medication, quantity: 1, frequency: 30 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    alert(`${medication.name} added to cart!`)
  }

  const handleSubscribePackage = async () => {
    if (!recommendations?.package) return

    // Get selected medications with their custom schedules
    const selectedMedications = medicationSchedules.filter(m => m.selected)

    // Create subscription with medication schedules
    const subscriptionData = {
      type: 'subscription',
      packageId: recommendations.package.id || 'package-1',
      name: 'Personalized Medication Schedule & Dosing',
      price: recommendations.package.finalPrice,
      frequency: 30,
      items: selectedMedications.map((med: any) => ({
        medicationId: med.id,
        name: med.name,
        dosage: med.customDosage,
        frequency: med.customFrequency,
        times: med.customTimes,
        instructions: med.customInstructions,
        price: med.price
      }))
    }

    localStorage.setItem('cart', JSON.stringify([subscriptionData]))
    
    // Mark onboarding as complete
    try {
      await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          onboardingComplete: true,
          medicationSchedules: selectedMedications
        })
      })
    } catch (error) {
      console.error('Failed to save onboarding:', error)
    }

    // Redirect to subscription checkout
    window.location.href = '/checkout/subscription'
  }

  const saveHealthProfile = async () => {
    try {
      // Combine conditions with otherCondition if specified
      const allConditions = [...formData.conditions]
      if (formData.conditions.includes('Other') && formData.otherCondition) {
        // Replace "Other" with the actual condition
        const index = allConditions.indexOf('Other')
        allConditions[index] = `Other: ${formData.otherCondition}`
      }

      const response = await fetch('/api/onboarding/health-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          conditions: allConditions,
          allergies: formData.allergies
        })
      })
      if (!response.ok) {
        console.error('Failed to save health profile')
      }
    } catch (error) {
      console.error('Error saving health profile:', error)
    }
  }

  const saveAddress = async () => {
    try {
      const response = await fetch('/api/onboarding/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseNumber: formData.houseNumber,
          additionalAddress: formData.additionalAddress,
          province: formData.province,
          city: formData.city,
          barangay: formData.barangay,
          zipCode: formData.zipCode,
          phone: formData.phone ? `+63${formData.phone}` : ''
        })
      })
      if (!response.ok) {
        console.error('Failed to save address')
      }
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

  const savePrescription = async () => {
    try {
      // Update onboarding step to 3 (prescription step completed)
      await fetch('/api/onboarding/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 3 })
      })

      if (!formData.prescriptionFile) return

      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.prescriptionFile)
      formDataToSend.append('notes', formData.prescriptionNotes)

      const response = await fetch('/api/onboarding/prescription', {
        method: 'POST',
        body: formDataToSend
      })
      if (!response.ok) {
        console.error('Failed to save prescription')
      }
    } catch (error) {
      console.error('Error saving prescription:', error)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    window.location.href = '/shop'
  }

  return (
    <div className="min-h-screen bg-[#f2f7e8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/medex.png" alt="DoorMed Express" className="h-10" />
          <button onClick={handleSkip} className="text-gray-600 hover:text-gray-800 text-sm">
            Skip for now
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1b4332] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Step 1: Health Profile */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#c9e265] rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-[#1b4332]" />
              </div>
              <div>
                <h2 className="text-2xl font-serif italic text-[#1b4332]">Health Profile</h2>
                <p className="text-gray-600">Help us personalize your experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you have any of these conditions? (Select all that apply)
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {conditions.map((condition) => (
                    <label
                      key={condition}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                        formData.conditions.includes(condition)
                          ? 'border-[#1b4332] bg-[#f2f7e8]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.conditions.includes(condition)}
                        onChange={() => handleConditionToggle(condition)}
                        className="w-5 h-5 text-[#1b4332] rounded"
                      />
                      <span className="font-medium text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
                
                {/* Show input field when "Other" is selected */}
                {formData.conditions.includes('Other') && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify your condition
                    </label>
                    <input
                      type="text"
                      value={formData.otherCondition}
                      onChange={(e) => setFormData({...formData, otherCondition: e.target.value})}
                      placeholder="Enter your specific condition"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies (Optional)
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="List any medication or food allergies..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery Address */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#c9e265] rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-[#1b4332]" />
              </div>
              <div>
                <h2 className="text-2xl font-serif italic text-[#1b4332]">Delivery Address</h2>
                <p className="text-gray-600">Where should we deliver your medications?</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">House/Unit No.</label>
                <input
                  type="text"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({...formData, houseNumber: e.target.value})}
                  placeholder="Unit 5B, Building Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Address</label>
                <input
                  type="text"
                  value={formData.additionalAddress}
                  onChange={(e) => setFormData({...formData, additionalAddress: e.target.value})}
                  placeholder="Street Name, Subdivision, Landmark"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                >
                  <option value="">Select Province</option>
                  {philippineProvinces.map((province) => (
                    <option key={province.name} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City/Municipality</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={!formData.province}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select City</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {!formData.province && (
                  <p className="text-sm text-gray-500 mt-1">Please select a province first</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
                <select
                  value={formData.barangay}
                  onChange={(e) => setFormData({...formData, barangay: e.target.value})}
                  disabled={!formData.city}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Barangay</option>
                  {availableBarangays.map((barangay) => (
                    <option key={barangay} value={barangay}>
                      {barangay}
                    </option>
                  ))}
                </select>
                {!formData.city && (
                  <p className="text-sm text-gray-500 mt-1">Please select a city first</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  placeholder="1100"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="w-24">
                    <input
                      type="text"
                      value="+63"
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setFormData({...formData, phone: value})
                    }}
                    placeholder="9171234567"
                    maxLength={10}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Enter 10-digit mobile number (e.g., 9171234567)</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Prescription Upload */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#c9e265] rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#1b4332]" />
              </div>
              <div>
                <h2 className="text-2xl font-serif italic text-[#1b4332]">Upload Prescription</h2>
                <p className="text-gray-600">Optional - You can add this later</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1b4332] transition">
                <input
                  type="file"
                  id="prescription"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="prescription" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {formData.prescriptionFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{formData.prescriptionFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium mb-2">Click to upload prescription</p>
                      <p className="text-sm text-gray-500">PNG, JPG, or PDF (Max 10MB)</p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.prescriptionNotes}
                  onChange={(e) => setFormData({...formData, prescriptionNotes: e.target.value})}
                  placeholder="Any special instructions or notes about your prescription..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Don&apos;t have your prescription handy?</p>
                  <p>No worries! You can upload it later from your dashboard or we can contact your doctor directly.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Analysis */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#c9e265] rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-[#1b4332]" />
              </div>
              <div>
                <h2 className="text-2xl font-serif italic text-[#1b4332]">Analyzing Your Health Profile</h2>
                <p className="text-gray-600">We&apos;re personalizing your experience</p>
              </div>
            </div>

            <div className="space-y-6">
              {analyzing ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#1b4332] mb-4"></div>
                  <p className="text-lg font-medium text-gray-700 mb-2">Analyzing your health data...</p>
                  <p className="text-gray-600">This will only take a moment</p>
                </div>
              ) : analysisComplete ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Analysis Complete!</h3>
                  <p className="text-gray-600 mb-6">We&apos;ve prepared personalized recommendations for you</p>
                  
                  <div className="bg-[#f2f7e8] rounded-xl p-6 text-left max-w-2xl mx-auto">
                    <h4 className="font-medium text-gray-900 mb-3">What we analyzed:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Your health conditions and medical history</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Potential medication interactions and allergies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Delivery preferences and location</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Available medications and treatment options</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Step 5: Medication Schedule Customization */}
        {step === 5 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#c9e265] rounded-xl flex items-center justify-center">
                <Pill className="h-6 w-6 text-[#1b4332]" />
              </div>
              <div>
                <h2 className="text-2xl font-serif italic text-[#1b4332]">Personalized Medication Schedule</h2>
                <p className="text-gray-600">Customize your dosage, frequency, and timing</p>
              </div>
            </div>

            <div className="space-y-6">
              {medicationSchedules.map((med, index) => (
                <div key={med.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={med.selected}
                        onChange={(e) => {
                          const updated = [...medicationSchedules]
                          updated[index].selected = e.target.checked
                          setMedicationSchedules(updated)
                        }}
                        className="w-5 h-5 text-[#1b4332] rounded mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-lg">{med.name}</h3>
                        <p className="text-sm text-gray-600">{med.category}</p>
                      </div>
                    </div>
                  </div>

                  {med.selected && (
                    <div className="ml-8 space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                          <input
                            type="text"
                            value={med.customDosage}
                            onChange={(e) => {
                              const updated = [...medicationSchedules]
                              updated[index].customDosage = e.target.value
                              setMedicationSchedules(updated)
                            }}
                            placeholder="e.g., 1 tablet, 10mg"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                          <select
                            value={med.customFrequency}
                            onChange={(e) => {
                              const updated = [...medicationSchedules]
                              updated[index].customFrequency = e.target.value
                              // Update times based on frequency
                              if (e.target.value === 'once daily') {
                                updated[index].customTimes = ['8:00 AM']
                              } else if (e.target.value === 'twice daily') {
                                updated[index].customTimes = ['8:00 AM', '8:00 PM']
                              } else if (e.target.value === 'three times daily') {
                                updated[index].customTimes = ['8:00 AM', '2:00 PM', '8:00 PM']
                              }
                              setMedicationSchedules(updated)
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                          >
                            <option value="once daily">Once daily</option>
                            <option value="twice daily">Twice daily</option>
                            <option value="three times daily">Three times daily</option>
                            <option value="as needed">As needed</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specific Times {med.customFrequency !== 'as needed' && `(${med.customTimes.length} times)`}
                        </label>
                        {med.customFrequency !== 'as needed' && (
                          <div className="grid md:grid-cols-3 gap-3">
                            {med.customTimes.map((time: string, timeIndex: number) => (
                              <input
                                key={timeIndex}
                                type="time"
                                value={time}
                                onChange={(e) => {
                                  const updated = [...medicationSchedules]
                                  updated[index].customTimes[timeIndex] = e.target.value
                                  setMedicationSchedules(updated)
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                              />
                            ))}
                          </div>
                        )}
                        {med.customFrequency === 'as needed' && (
                          <p className="text-sm text-gray-500 italic">Take as needed based on symptoms</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions (Optional)
                        </label>
                        <input
                          type="text"
                          value={med.customInstructions}
                          onChange={(e) => {
                            const updated = [...medicationSchedules]
                            updated[index].customInstructions = e.target.value
                            setMedicationSchedules(updated)
                          }}
                          placeholder="e.g., with food, before sleep, on empty stomach"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Personalized Schedule</p>
                  <p>This schedule will help you track your medications and ensure you never miss a dose. You can always adjust it later from your dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Final Recommendations */}
        {step === 6 && (
          <div className="space-y-6">
            {/* Subscription Package */}
            {recommendations?.package && (
              <div className="bg-gradient-to-br from-[#1b4332] to-[#2d5a45] rounded-2xl p-8 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="inline-block bg-[#c9e265] text-[#1b4332] px-3 py-1 rounded-full text-sm font-medium mb-3">
                      Recommended Package
                    </div>
                    <h2 className="text-3xl font-serif italic mb-2">Personalized Medication Schedule & Dosing</h2>
                    <p className="text-[#c9e265] opacity-90">{recommendations.package.description}</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-[#c9e265] text-sm mb-1">Monthly Price</p>
                      <p className="text-2xl font-bold">₱{recommendations.package.monthlyPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#c9e265] text-sm mb-1">You Save</p>
                      <p className="text-2xl font-bold text-green-300">₱{recommendations.package.savings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#c9e265] text-sm mb-1">Final Price</p>
                      <p className="text-3xl font-bold">₱{recommendations.package.finalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <p className="text-sm text-[#c9e265] mb-3">Package includes:</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {recommendations.package.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-300 flex-shrink-0" />
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubscribePackage}
                  className="w-full bg-[#c9e265] text-[#1b4332] py-4 rounded-xl font-medium text-lg hover:bg-[#d4ed70] transition flex items-center justify-center gap-2"
                >
                  Subscribe to Package
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Individual Medications */}
            {recommendations?.medications && recommendations.medications.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-serif italic text-[#1b4332] mb-4">Recommended Medications</h3>
                <div className="space-y-4">
                  {recommendations.medications.map((med: any) => (
                    <div key={med.id} className="border border-gray-200 rounded-xl p-6 hover:border-[#1b4332] transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-lg">{med.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">{med.dosage}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block bg-[#f2f7e8] text-[#1b4332] px-3 py-1 rounded-full text-xs font-medium">
                              For {med.condition}
                            </span>
                            {med.requiresPrescription && (
                              <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                Requires Prescription
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-[#1b4332]">₱{med.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">per month</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(med.id)}
                        className="w-full bg-[#1b4332] text-[#c9e265] py-3 rounded-xl font-medium hover:bg-[#143528] transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplements */}
            {recommendations?.supplements && recommendations.supplements.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-serif italic text-[#1b4332] mb-4">Recommended Supplements</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.supplements.map((supp: any) => (
                    <div key={supp.id} className="border border-gray-200 rounded-xl p-6 hover:border-[#1b4332] transition">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">{supp.name}</h4>
                        <p className="text-sm text-gray-600">{supp.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#1b4332]">₱{supp.price.toLocaleString()}</span>
                        <button
                          onClick={() => handleAddToCart(supp.id)}
                          className="bg-[#1b4332] text-[#c9e265] px-4 py-2 rounded-lg font-medium hover:bg-[#143528] transition text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback if no recommendations */}
            {!recommendations && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[#f2f7e8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-10 w-10 text-[#1b4332]" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to Explore!</h3>
                  <p className="text-gray-600 mb-6">
                    Your profile is complete. Browse our full catalog to find the medications you need.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Reminder</p>
                <p>These are suggestions based on your profile. Always consult with your healthcare provider before starting any new medication.</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1 || step === 4}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
              step === 1 || step === 4
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#1b4332] hover:bg-white border border-gray-200'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={step === 4 && !analysisComplete}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition ${
              step === 4 && !analysisComplete
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#1b4332] text-[#c9e265] hover:bg-[#143528]'
            }`}
          >
            {step === totalSteps ? 'Start Shopping' : step === 4 ? 'Continue' : step === 5 ? 'View Package' : 'Continue'}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  )
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f2f7e8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1b4332] mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
