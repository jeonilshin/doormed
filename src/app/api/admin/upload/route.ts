import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getUserFromToken } from '@/lib/auth'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Check for both admin token and rider token
    const adminToken = request.cookies.get('token')?.value
    const riderToken = request.cookies.get('rider_token')?.value

    if (!adminToken && !riderToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify user is either admin or rider
    let isAuthorized = false
    
    if (adminToken) {
      const user = await getUserFromToken(adminToken)
      if (user && (user as any).role === 'admin') {
        isAuthorized = true
      }
    }
    
    if (!isAuthorized && riderToken) {
      const { getRiderFromToken } = await import('@/lib/auth')
      const rider = await getRiderFromToken(riderToken)
      if (rider) {
        isAuthorized = true
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'doormed-products',
      resource_type: 'auto',
    })

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
