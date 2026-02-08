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
  
  // Delete all users EXCEPT admin accounts
  await prisma.user.deleteMany({
    where: {
      email: {
        not: 'jeonilshinbusiness@gmail.com'
      }
    }
  })

  console.log('✅ Cleared all data (kept admin account: jeonilshinbusiness@gmail.com)')

  // STEP 2: Create medications inventory (available for all users to shop)
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

  // STEP 3: Ensure admin account exists (don't modify if exists)
  console.log('👤 Checking admin account...')
  
  const testUserEmail = 'jeonilshinbusiness@gmail.com'
  
  // Check if admin exists
  let testUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  })
  
  // Only create if doesn't exist
  if (!testUser) {
    console.log('Creating new admin account...')
    const hashedPassword = await hashPassword('admin123')
    
    testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+639171234567',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        emailVerified: true,
        onboardingStep: 5,
        role: 'admin'
      }
    })
    console.log('✅ Created admin account')
    console.log('   Email: jeonilshinbusiness@gmail.com')
    console.log('   Password: admin123')
  } else {
    console.log('✅ Admin account already exists (preserved)')
  }

  // Create health profile for test user
  await prisma.healthProfile.create({
    data: {
      userId: testUser.id,
      conditions: ['Hypertension', 'High Cholesterol'],
      allergies: 'Penicillin, Shellfish'
    }
  })
  console.log('✅ Created health profile')

  // Create address for test user
  const address = await prisma.address.create({
    data: {
      userId: testUser.id,
      street: 'Unit 5B, Sunshine Building, 123 Bonifacio Street, Barangay San Lorenzo',
      city: 'Makati City',
      state: 'Metro Manila',
      zipCode: '1223',
      isDefault: true
    }
  })
  console.log('✅ Created address')

  // Get medications for test user's profile
  const lisinopril = await prisma.medication.findFirst({ where: { sku: 'MED-LIS-10' } })
  const atorvastatin = await prisma.medication.findFirst({ where: { sku: 'MED-ATO-20' } })
  const multivitamin = await prisma.medication.findFirst({ where: { sku: 'SUP-MULTI-01' } })

  if (lisinopril && atorvastatin && multivitamin) {
    // Create user medications for test user
    await prisma.userMedication.create({
      data: {
        userId: testUser.id,
        medicationId: lisinopril.id,
        dosage: '10mg',
        frequency: 'once daily',
        time: ['8:00 AM'],
        instruction: 'Take with food',
        status: 'active',
        adherence: 94
      }
    })

    await prisma.userMedication.create({
      data: {
        userId: testUser.id,
        medicationId: atorvastatin.id,
        dosage: '20mg',
        frequency: 'once daily',
        time: ['8:00 PM'],
        instruction: 'Take before sleep',
        status: 'active',
        adherence: 92
      }
    })

    await prisma.userMedication.create({
      data: {
        userId: testUser.id,
        medicationId: multivitamin.id,
        dosage: '1 capsule',
        frequency: 'once daily',
        time: ['8:00 AM'],
        instruction: 'Take with breakfast',
        status: 'active',
        adherence: 96
      }
    })
    console.log('✅ Created user medications')

    // Create subscription for test user
    const subscription = await prisma.subscription.create({
      data: {
        userId: testUser.id,
        name: 'Hypertension Care Pack',
        status: 'active',
        frequency: 30,
        nextDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        price: 3180
      }
    })

    await prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscription.id,
        medicationId: lisinopril.id,
        quantity: 30
      }
    })

    await prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscription.id,
        medicationId: atorvastatin.id,
        quantity: 30
      }
    })
    console.log('✅ Created subscription')

    // Create order for test user
    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        addressId: address.id,
        status: 'processing',
        subtotal: 3180,
        tax: 381.6, // 12% VAT
        shipping: 0,
        total: 3561.6
      }
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        medicationId: lisinopril.id,
        quantity: 30,
        price: 1250
      }
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        medicationId: atorvastatin.id,
        quantity: 30,
        price: 1580
      }
    })
    console.log('✅ Created order')

    // Create delivery for test user
    await prisma.delivery.create({
      data: {
        orderId: order.id,
        userId: testUser.id,
        addressId: address.id,
        status: 'in_transit',
        estimatedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        driverName: 'Juan Dela Cruz',
        trackingNumber: 'DME-2024-' + Math.random().toString(36).substring(7).toUpperCase()
      }
    })
    console.log('✅ Created delivery')
  }

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📝 Summary:')
  console.log('   - Medications inventory: Available for all users')
  console.log('   - Test user with FULL fake data: jeonilshinbusiness@gmail.com')
  console.log('   - Password: password123')
  console.log('   - Role: admin')
  console.log('   - New users will start with EMPTY profiles')
  console.log('')

  // STEP 4: Create demo rider
  console.log('🏍️ Creating demo rider...')
  
  const hashedRiderPassword = await hashPassword('rider123')
  
  await prisma.rider.create({
    data: {
      email: 'rider@doormedexpress.com',
      password: hashedRiderPassword,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      phone: '09171234567',
      vehicleType: 'motorcycle',
      licenseNumber: 'N01-12-345678',
      status: 'active'
    }
  })

  console.log('✅ Demo rider created')
  console.log('   Email: rider@doormedexpress.com')
  console.log('   Password: rider123')
  console.log('')
  
  console.log('🎉 Seed complete!')
  console.log('')
  console.log('📝 Summary:')
  console.log('   ✅ Admin account: jeonilshinbusiness@gmail.com')
  console.log('   ✅ Demo rider: rider@doormedexpress.com / rider123')
  console.log('   ✅ Medications inventory: Ready')
  console.log('   ✅ Database: Clean and ready for customers')
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
