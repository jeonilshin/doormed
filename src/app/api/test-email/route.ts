import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  try {
    console.log('🔍 Testing Resend configuration...')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_FROM:', process.env.RESEND_FROM)
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not configured',
        message: 'Please add RESEND_API_KEY to your .env file'
      }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Send test email
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || 'DoorMedExpress <onboarding@resend.dev>',
      to: 'jeonilshinbusiness@gmail.com', // Your email
      subject: 'Test Email from DoorMedExpress',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #1b4332;">Test Email</h1>
            <p>This is a test email from DoorMedExpress.</p>
            <p>If you received this, Resend is working correctly! ✅</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </body>
        </html>
      `
    })

    console.log('✅ Test email sent successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      data
    })
  } catch (error: any) {
    console.error('❌ Test email failed:', error)
    return NextResponse.json({
      error: 'Failed to send test email',
      message: error.message,
      details: error
    }, { status: 500 })
  }
}
