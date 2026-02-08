import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token and get user ID
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const notes = formData.get('notes') as string

    // Update onboarding step to completed
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { onboardingStep: 4 } // Completed all steps
    })

    if (!file) {
      return NextResponse.json({ success: true }) // No file uploaded, that's okay
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'doormed-prescriptions',
      resource_type: 'auto',
      // Add user ID to public_id for easy identification
      public_id: `${decoded.userId}_${Date.now()}`,
    })

    // Save prescription record to database
    await prisma.prescription.create({
      data: {
        userId: decoded.userId,
        fileName: file.name,
        fileUrl: result.secure_url,
        notes: notes || null,
        status: 'pending'
      }
    })

    return NextResponse.json({ success: true, url: result.secure_url })
  } catch (error) {
    console.error('Prescription upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload prescription' },
      { status: 500 }
    )
  }
}
