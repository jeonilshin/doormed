import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // STEP 1: Clear ALL existing data (in correct order due to foreign key constraints)
  console.log('🧹 Clearing all existing data...')
  
  // Delete in order: child tables first, then parent tables
  await prisma.orderItem.deleteMany({})
  await prisma.delivery.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.subscriptionItem.deleteMany({})
  await prisma.subscription.deleteMany({})
  await prisma.userMedication.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.supportMessage.deleteMany({})
  await prisma.familyMember.deleteMany({})
  await prisma.prescription.deleteMany({})
  await prisma.address.deleteMany({})
  await prisma.healthProfile.deleteMany({})
  await prisma.medication.deleteMany({})
  await prisma.rider.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('✅ Cleared all data')

  // STEP 2: Create Admin Account
  console.log('👤 Creating admin account...')
  
  const hashedAdminPassword = await hashPassword('password123')
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'jeon@admin.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'Jeon',
      phone: '+639171234567',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      emailVerified: true,
      onboardingStep: 5,
      onboardingComplete: true,
      role: 'admin'
    }
  })
  
  console.log('✅ Created admin account')
  console.log('   Email: jeon@admin.com')
  console.log('   Password: password123')

  // STEP 3: Create Rider Accounts
  console.log('🏍️ Creating rider accounts...')
  
  const hashedRiderPassword = await hashPassword('password123')
  
  const rider1 = await prisma.rider.create({
    data: {
      email: 'rider1@rider.com',
      password: hashedRiderPassword,
      firstName: 'Rider',
      lastName: 'One',
      phone: '09171234567',
      vehicleType: 'motorcycle',
      vehiclePlate: 'ABC-1234',
      licenseNumber: 'N01-12-345678',
      status: 'active'
    }
  })

  const rider2 = await prisma.rider.create({
    data: {
      email: 'rider2@rider.com',
      password: hashedRiderPassword,
      firstName: 'Rider',
      lastName: 'Two',
      phone: '09181234567',
      vehicleType: 'motorcycle',
      vehiclePlate: 'XYZ-5678',
      licenseNumber: 'N01-12-987654',
      status: 'active'
    }
  })

  console.log('✅ Created rider accounts')
  console.log('   Rider 1: rider1@rider.com / password123')
  console.log('   Rider 2: rider2@rider.com / password123')

  // STEP 4: Create medications inventory
  console.log('📦 Creating medications inventory...')
  
  const medications = [
    {
      name: 'Lisinopril 10mg',
      dosage: '10mg tablet',
      category: 'Hypertension',
      price: 1250,
      description: 'ACE inhibitor for high blood pressure',
      requiresPrescription: true,
      inStock: true,
      stockQuantity: 500,
      lowStockThreshold: 50,
      sku: 'MED-LIS-10',
      manufacturer: 'PharmaCorp Philippines'
    },
    {
      name: 'Amlodipine 5mg',
      dosage: '5mg tablet',
      category: 'Hypertension',
      price: 980,
      description: 'Calcium channel blocker for blood pressure control',
      requiresPrescription: true,
      inStock: true,
      stockQuantity: 750,
      lowStockThreshold: 50,
      sku: 'MED-AML-5',
      manufacturer: 'MediPharm Inc'
    },
    {
      name: 'Atorvastatin 20mg',
      dosage: '20mg tablet',
      category: 'High Cholesterol',
      price: 1580,
      description: 'Statin medication for cholesterol management',
      requiresPrescription: true,
      inStock: true,
      stockQuantity: 600,
      lowStockThreshold: 50,
      sku: 'MED-ATO-20',
      manufacturer: 'PharmaCorp Philippines'
    },
    {
      name: 'Metformin 500mg',
      dosage: '500mg tablet',
      category: 'Diabetes',
      price: 850,
      description: 'Blood sugar control medication',
      requiresPrescription: true,
      inStock: true,
      stockQuantity: 800,
      lowStockThreshold: 100,
      sku: 'MED-MET-500',
      manufacturer: 'DiabetesCare PH'
    },
    {
      name: 'Multivitamin Daily',
      dosage: '1 capsule',
      category: 'Vitamins & Supplements',
      price: 850,
      description: 'Complete daily multivitamin with minerals',
      requiresPrescription: false,
      inStock: true,
      stockQuantity: 1000,
      lowStockThreshold: 100,
      sku: 'SUP-MULTI-01',
      manufacturer: 'VitaHealth Philippines'
    },
    {
      name: 'Omega-3 Fish Oil',
      dosage: '1000mg capsule',
      category: 'Vitamins & Supplements',
      price: 1350,
      description: 'Heart health support with EPA and DHA',
      requiresPrescription: false,
      inStock: true,
      stockQuantity: 800,
      lowStockThreshold: 80,
      sku: 'SUP-OMEGA-1000',
      manufacturer: 'OceanHealth PH'
    },
    {
      name: 'Vitamin D3 2000 IU',
      dosage: '2000 IU softgel',
      category: 'Vitamins & Supplements',
      price: 680,
      description: 'Bone health and immune support',
      requiresPrescription: false,
      inStock: true,
      stockQuantity: 1200,
      lowStockThreshold: 100,
      sku: 'SUP-VITD-2000',
      manufacturer: 'SunVita Philippines'
    },
    {
      name: 'Aspirin 81mg',
      dosage: '81mg tablet',
      category: 'Heart Disease',
      price: 450,
      description: 'Low-dose aspirin for heart health',
      requiresPrescription: false,
      inStock: true,
      stockQuantity: 2000,
      lowStockThreshold: 200,
      sku: 'MED-ASP-81',
      manufacturer: 'CardioMed PH'
    }
  ]

  for (const med of medications) {
    await prisma.medication.create({
      data: med
    })
  }
  console.log('✅ Created medications inventory')

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📝 Account Summary:')
  console.log('   ✅ Admin: jeon@admin.com / password123')
  console.log('   ✅ Rider 1: rider1@rider.com / password123')
  console.log('   ✅ Rider 2: rider2@rider.com / password123')
  console.log('   ✅ Medications: 8 items in inventory')
  console.log('   ✅ Database: Clean and ready')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
