import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// Medication recommendations by category (referenced from medicines.txt)
const medicationRecommendations: Record<string, string[]> = {
  'Cholesterol Control': [
    'Atorvastatin',
    'Rosuvastatin',
    'Simvastatin',
    'Pravastatin',
    'Lovastatin',
    'Ezetimibe'
  ],
  'Blood Thinners': [
    'Apixaban',
    'Rivaroxaban',
    'Dabigatran',
    'Warfarin',
    'Aspirin',
    'Clopidogrel',
    'Ticagrelor'
  ],
  'Diabetics': [
    'Metformin',
    'Empagliflozin',
    'Dapagliflozin',
    'Canagliflozin',
    'Semaglutide',
    'Dulaglutide',
    'Liraglutide',
    'Sitagliptin',
    'Linagliptin'
  ],
  'Antihistamines': [
    'Cetirizine',
    'Loratadine',
    'Fexofenadine',
    'Desloratadine',
    'Diphenhydramine',
    'Chlorpheniramine'
  ]
}

// Map health conditions to medicine categories
const conditionToCategory: Record<string, string> = {
  'Hypertension': 'Blood Thinners',
  'High Cholesterol': 'Cholesterol Control',
  'Diabetes': 'Diabetics',
  'Heart Disease': 'Blood Thinners',
  'Asthma': 'Antihistamines',
  'Arthritis': 'Antihistamines'
}

// Supplement recommendations (PHP pricing)
const supplementRecommendations = [
  { name: 'Multivitamin Daily', price: 850, category: 'General Health' },
  { name: 'Omega-3 Fish Oil', price: 1350, category: 'Heart Health' },
  { name: 'Vitamin D3 2000 IU', price: 680, category: 'Bone Health' },
  { name: 'Calcium + Magnesium', price: 980, category: 'Bone Health' },
  { name: 'Probiotic Complex', price: 1580, category: 'Digestive Health' }
]

async function generateRecommendations(token: string) {
  const user = await getUserFromToken(token)
  if (!user) {
    throw new Error('Invalid token')
  }

  // Get user's health profile
  const healthProfile = await prisma.healthProfile.findUnique({
    where: { userId: user.id }
  })

  if (!healthProfile) {
    throw new Error('Health profile not found')
  }

  // Get user's prescription medications if uploaded
  const prescriptions = await prisma.prescription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  // Generate medication recommendations based on conditions
  const recommendedMedications: any[] = []
  const conditions = healthProfile.conditions || []

  for (const condition of conditions) {
    // Map condition to medicine category
    const category = conditionToCategory[condition] || condition
    const meds = medicationRecommendations[category] || []
    
    // Take first 2-3 medications from each category
    for (const medName of meds.slice(0, 3)) {
      // Create medication entry (NOT from inventory - these are for subscription tracking only)
      const medicationData = {
        id: `med-${medName.toLowerCase().replace(/\s+/g, '-')}`,
        name: medName,
        dosage: '1 tablet daily', // Default, will be customized in next step
        price: Math.floor(Math.random() * 1500 + 1000), // Random price between ₱1000-₱2500
        condition: condition,
        requiresPrescription: true,
        category: category,
        frequency: 'once daily', // Default
        times: ['8:00 AM'], // Default
        instructions: 'Take with food' // Default
      }

      recommendedMedications.push(medicationData)
    }
  }

  // Add supplement recommendations
  const recommendedSupplements = supplementRecommendations.map(supp => ({
    id: `supp-${supp.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: supp.name,
    price: supp.price,
    category: supp.category,
    dosage: '1 capsule daily',
    frequency: 'once daily',
    times: ['8:00 AM'],
    instructions: 'Take with meal'
  }))

  // Calculate recommended subscription package
  const totalSupplements = Math.min(2, recommendedSupplements.length) // Recommend 2 supplements
  
  const selectedSupplements = recommendedSupplements.slice(0, totalSupplements)
  const monthlyPrice = recommendedMedications.reduce((sum, med) => sum + med.price, 0) +
                      selectedSupplements.reduce((sum, supp) => sum + supp.price, 0)

  return {
    analysis: {
      conditions: conditions,
      riskLevel: conditions.length >= 3 ? 'high' : conditions.length >= 2 ? 'medium' : 'low',
      recommendationCount: recommendedMedications.length + selectedSupplements.length,
      hasPrescription: prescriptions.length > 0
    },
    medications: recommendedMedications,
    supplements: selectedSupplements,
    package: {
      name: 'Personalized Medication Schedule & Dosing',
      description: `Custom medication schedule for ${conditions.join(', ')}`,
      monthlyPrice: monthlyPrice,
      savings: Math.floor(monthlyPrice * 0.15), // 15% savings
      finalPrice: Math.floor(monthlyPrice * 0.85),
      frequency: 30, // days
      items: [
        ...recommendedMedications.map(m => ({ 
          id: m.id, 
          name: m.name, 
          type: 'medication',
          dosage: m.dosage,
          frequency: m.frequency,
          times: m.times,
          instructions: m.instructions
        })),
        ...selectedSupplements.map(s => ({ 
          id: s.id, 
          name: s.name, 
          type: 'supplement',
          dosage: s.dosage,
          frequency: s.frequency,
          times: s.times,
          instructions: s.instructions
        }))
      ]
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const data = await generateRecommendations(token)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Generate recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const data = await generateRecommendations(token)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Generate recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
