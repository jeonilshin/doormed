import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, vehicleType, vehiclePlate, licenseNumber } = body

    // Check if rider already exists
    const existingRider = await prisma.rider.findUnique({
      where: { email }
    })

    if (existingRider) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create rider
    const rider = await prisma.rider.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        vehicleType,
        vehiclePlate,
        licenseNumber,
        status: 'pending' // Requires admin approval
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Rider account created successfully. Please wait for admin approval.'
    })
  } catch (error) {
    console.error('Rider signup error:', error)
    return NextResponse.json({ error: 'Failed to create rider account' }, { status: 500 })
  }
}
