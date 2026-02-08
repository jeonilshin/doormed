import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// AI-powered medication recommendations based on conditions
const medicationRecommendations: Record<string, string[]> = {
  'Hypertension': ['Lisinopril 10mg', 'Amlodipine 5mg', 'Losartan 50mg'],
  'High Cholesterol': ['Atorvastatin 20mg', 'Simvastatin 40mg', 'Rosuvastatin 10mg'],
  'Diabetes': ['Metformin 500mg', 'Glipizide 5mg', 'Insulin Glargine'],
  'Heart Disease': ['Aspirin 81mg', 'Metoprolol 50mg', 'Clopidogrel 75mg'],
  'Asthma': ['Albuterol Inhaler', 'Fluticasone Inhaler', 'Montelukast 10mg'],
  'Arthritis': ['Ibuprofen 400mg', 'Naproxen 500mg', 'Celecoxib 200mg']
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

  // Generate medication recommendations based on conditions
  const recommendedMedications: any[] = []
  const conditions = healthProfile.conditions || []

  for (const condition of conditions) {
    const meds = medicationRecommendations[condition] || []
    for (const medName of meds) {
      // Check if medication exists in database
      let medication = await prisma.medication.findFirst({
        where: { name: { contains: medName.split(' ')[0] } }
      })

      // If not exists, create it (PHP pricing)
      if (!medication) {
        medication = await prisma.medication.create({
          data: {
            name: medName,
            dosage: medName.split(' ').slice(1).join(' ') || '1 tablet',
            category: condition,
            price: Math.floor(Math.random() * 1500 + 1000), // Random price between ₱1000-₱2500
            description: `Prescribed for ${condition}`,
            requiresPrescription: true,
            inStock: true
          }
        })
      }

      recommendedMedications.push({
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage,
        price: medication.price,
        condition: condition,
        requiresPrescription: medication.requiresPrescription
      })
    }
  }

  // Add supplement recommendations
  const recommendedSupplements = []
  for (const supp of supplementRecommendations) {
    let supplement = await prisma.medication.findFirst({
      where: { name: supp.name }
    })

    if (!supplement) {
      supplement = await prisma.medication.create({
        data: {
          name: supp.name,
          dosage: '1 capsule daily',
          category: supp.category,
          price: supp.price,
          description: `${supp.category} supplement`,
          requiresPrescription: false,
          inStock: true
        }
      })
    }

    recommendedSupplements.push({
      id: supplement.id,
      name: supplement.name,
      price: supplement.price,
      category: supp.category
    })
  }

  // Calculate recommended subscription package
  const totalSupplements = Math.min(2, recommendedSupplements.length) // Recommend 2 supplements
  
  const selectedSupplements = recommendedSupplements.slice(0, totalSupplements)
  const monthlyPrice = recommendedMedications.reduce((sum, med) => sum + med.price, 0) +
                      selectedSupplements.reduce((sum, supp) => sum + supp.price, 0)

  return {
    analysis: {
      conditions: conditions,
      riskLevel: conditions.length >= 3 ? 'high' : conditions.length >= 2 ? 'medium' : 'low',
      recommendationCount: recommendedMedications.length + selectedSupplements.length
    },
    medications: recommendedMedications,
    supplements: selectedSupplements,
    package: {
      name: 'Personalized Health Package',
      description: `Custom package for ${conditions.join(', ')}`,
      monthlyPrice: monthlyPrice,
      savings: Math.floor(monthlyPrice * 0.15), // 15% savings
      finalPrice: Math.floor(monthlyPrice * 0.85),
      frequency: 30, // days
      items: [
        ...recommendedMedications.map(m => ({ id: m.id, name: m.name, type: 'medication' })),
        ...selectedSupplements.map(s => ({ id: s.id, name: s.name, type: 'supplement' }))
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
