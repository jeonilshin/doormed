import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET - Fetch all medications
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const medications = await prisma.medication.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ medications })
  } catch (error) {
    console.error('Fetch inventory error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// PATCH - Update medication stock
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, stockQuantity } = body

    const medication = await prisma.medication.update({
      where: { id },
      data: { 
        stockQuantity,
        inStock: stockQuantity > 0
      }
    })

    return NextResponse.json({ success: true, medication })
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}

// POST - Create new medication
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const medication = await prisma.medication.create({
      data: {
        ...body,
        inStock: body.stockQuantity > 0
      }
    })

    return NextResponse.json({ success: true, medication })
  } catch (error) {
    console.error('Create medication error:', error)
    return NextResponse.json(
      { error: 'Failed to create medication' },
      { status: 500 }
    )
  }
}

// DELETE - Delete medication
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id } = body

    // Delete related records first to avoid foreign key constraint
    await prisma.userMedication.deleteMany({
      where: { medicationId: id }
    })

    await prisma.orderItem.deleteMany({
      where: { medicationId: id }
    })

    await prisma.subscriptionItem.deleteMany({
      where: { medicationId: id }
    })

    // Now delete the medication
    await prisma.medication.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete medication error:', error)
    return NextResponse.json(
      { error: 'Failed to delete medication. It may be in use.' },
      { status: 500 }
    )
  }
}

// PUT - Update full medication details
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    const medication = await prisma.medication.update({
      where: { id },
      data: {
        ...updateData,
        inStock: updateData.stockQuantity > 0
      }
    })

    return NextResponse.json({ success: true, medication })
  } catch (error) {
    console.error('Update medication error:', error)
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    )
  }
}
