import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all medications for package creation
    const medications = await prisma.medication.findMany({
      where: { inStock: true }
    })

    // Define pre-made packages
    const packages = [
      {
        id: 'hypertension-care',
        name: 'Hypertension Care Pack',
        description: 'Complete monthly supply for blood pressure management',
        price: 3180,
        frequency: 30,
        category: 'Hypertension',
        items: [
          {
            medication: medications.find(m => m.name.includes('Lisinopril')),
            quantity: 30
          },
          {
            medication: medications.find(m => m.name.includes('Amlodipine')),
            quantity: 30
          }
        ].filter(item => item.medication) // Remove if medication not found
      },
      {
        id: 'diabetes-management',
        name: 'Diabetes Management Pack',
        description: 'Essential medications for diabetes control',
        price: 2850,
        frequency: 30,
        category: 'Diabetes',
        items: [
          {
            medication: medications.find(m => m.name.includes('Metformin')),
            quantity: 60
          }
        ].filter(item => item.medication)
      },
      {
        id: 'daily-wellness',
        name: 'Daily Wellness Pack',
        description: 'Complete vitamin and supplement bundle',
        price: 2500,
        frequency: 30,
        category: 'Vitamins & Supplements',
        items: [
          {
            medication: medications.find(m => m.name.includes('Multivitamin')),
            quantity: 30
          },
          {
            medication: medications.find(m => m.name.includes('Omega-3')),
            quantity: 30
          },
          {
            medication: medications.find(m => m.name.includes('Vitamin D3')),
            quantity: 30
          }
        ].filter(item => item.medication)
      },
      {
        id: 'cholesterol-control',
        name: 'Cholesterol Control Pack',
        description: 'Monthly supply for cholesterol management',
        price: 1850,
        frequency: 30,
        category: 'High Cholesterol',
        items: [
          {
            medication: medications.find(m => m.name.includes('Atorvastatin')),
            quantity: 30
          }
        ].filter(item => item.medication)
      },
      {
        id: 'heart-health',
        name: 'Heart Health Pack',
        description: 'Support your cardiovascular health',
        price: 1200,
        frequency: 30,
        category: 'Heart Disease',
        items: [
          {
            medication: medications.find(m => m.name.includes('Aspirin')),
            quantity: 30
          },
          {
            medication: medications.find(m => m.name.includes('Omega-3')),
            quantity: 30
          }
        ].filter(item => item.medication)
      }
    ]

    // Filter out packages with no items
    const availablePackages = packages.filter(pkg => pkg.items.length > 0)

    return NextResponse.json({ packages: availablePackages })
  } catch (error) {
    console.error('Get packages error:', error)
    return NextResponse.json({ error: 'Failed to get packages' }, { status: 500 })
  }
}
