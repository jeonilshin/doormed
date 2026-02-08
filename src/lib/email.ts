import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper to send email or log to console
async function sendEmail(options: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 Email would be sent (Resend not configured):', {
      to: options.to,
      subject: options.subject,
    })
    return
  }

  try {
    // TEMPORARY: Override recipient for testing with Resend test domain
    // Remove this when you have a verified domain
    const isDevelopment = process.env.NODE_ENV === 'development'
    const testEmail = 'jeonilshinbusiness@gmail.com' // Your verified email
    const recipientEmail = isDevelopment ? testEmail : options.to

    if (isDevelopment && options.to !== testEmail) {
      console.log(`📧 [DEV MODE] Redirecting email from ${options.to} to ${testEmail}`)
    }

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || 'DoorMedExpress <onboarding@resend.dev>',
      to: recipientEmail,
      subject: options.subject,
      html: options.html,
    })
    console.log('✅ Email sent successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw error
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Verify your DoorMedExpress account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic;">Welcome to DoorMedExpress!</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you for signing up. Please verify your email address by clicking the button below:
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #1b4332; border-radius: 8px; padding: 16px 32px;">
                            <a href="${verificationUrl}" style="color: #c9e265; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                              Verify Email
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${verificationUrl}" style="color: #1b4332; word-break: break-all;">${verificationUrl}</a>
                      </p>
                      <p style="color: #999; font-size: 12px; margin: 30px 0 0 0;">
                        This link will expire in 24 hours.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your DoorMedExpress password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic;">Password Reset Request</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #1b4332; border-radius: 8px; padding: 16px 32px;">
                            <a href="${resetUrl}" style="color: #c9e265; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #1b4332; word-break: break-all;">${resetUrl}</a>
                      </p>
                      <p style="color: #999; font-size: 12px; margin: 30px 0 0 0;">
                        This link will expire in 1 hour. If you didn't request this, please ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendOrderConfirmationEmail(email: string, orderDetails: any) {
  await sendEmail({
    to: email,
    subject: 'Order Confirmation - DoorMedExpress',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic;">Order Confirmed! 🎉</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you for your order. Your subscription has been successfully set up.
                      </p>
                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <h2 style="color: #1b4332; margin: 0 0 15px 0; font-size: 20px;">Order Details</h2>
                            <p style="color: #333; margin: 8px 0;"><strong>Order Number:</strong> ${orderDetails.id}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Total:</strong> $${orderDetails.total.toFixed(2)}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                        You can track your order in your dashboard.
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #1b4332; border-radius: 8px; padding: 16px 32px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deliveries" style="color: #c9e265; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                              Track Order
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendDeliveryNotification(email: string, deliveryDetails: any) {
  await sendEmail({
    to: email,
    subject: 'Your delivery is on the way! 🚚 - DoorMedExpress',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic;">Your Delivery is On the Way!</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Your medications are being delivered today.
                      </p>
                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <p style="color: #333; margin: 8px 0;"><strong>Driver:</strong> ${deliveryDetails.driverName}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Estimated Time:</strong> ${deliveryDetails.estimatedTime}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Tracking Number:</strong> ${deliveryDetails.trackingNumber}</p>
                          </td>
                        </tr>
                      </table>
                      <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #1b4332; border-radius: 8px; padding: 16px 32px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deliveries" style="color: #c9e265; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                              Track Delivery
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendMedicationReminder(email: string, medications: any[]) {
  await sendEmail({
    to: email,
    subject: '⏰ Time to take your medications - DoorMedExpress',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic;">Medication Reminder</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        It's time to take your medications:
                      </p>
                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 20px 0;">
                        <tr>
                          <td>
                            <ul style="margin: 0; padding-left: 20px;">
                              ${medications.map(med => `<li style="color: #333; margin: 8px 0;"><strong>${med.name}</strong> - ${med.dosage}</li>`).join('')}
                            </ul>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Stay consistent with your health routine! 💪
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendOrderReceiptEmail(email: string, orderDetails: any) {
  await sendEmail({
    to: email,
    subject: `Order Receipt #${orderDetails.orderNumber} - DoorMedExpress`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic;">Order Confirmed! 🎉</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you for your order. We've received your order and will start preparing it soon.
                      </p>
                      
                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <h2 style="color: #1b4332; margin: 0 0 15px 0; font-size: 20px;">Order Details</h2>
                            <p style="color: #333; margin: 8px 0;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>
                          </td>
                        </tr>
                      </table>

                      <h3 style="color: #1b4332; margin: 30px 0 15px 0; font-size: 18px;">Items Ordered</h3>
                      <table width="100%" cellpadding="10" cellspacing="0" style="border-top: 2px solid #f2f7e8;">
                        ${orderDetails.items.map((item: any) => `
                          <tr style="border-bottom: 1px solid #f2f7e8;">
                            <td style="padding: 15px 0;">
                              <strong style="color: #333;">${item.name}</strong><br>
                              <span style="color: #666; font-size: 14px;">${item.dosage || ''}</span>
                            </td>
                            <td style="text-align: center; color: #666;">x${item.quantity}</td>
                            <td style="text-align: right; color: #1b4332; font-weight: bold;">₱${item.price.toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </table>

                      <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0;">
                        <tr>
                          <td style="text-align: right; color: #666;">Subtotal:</td>
                          <td style="text-align: right; color: #333; width: 100px;">₱${orderDetails.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="text-align: right; color: #666;">VAT (12%):</td>
                          <td style="text-align: right; color: #333;">₱${orderDetails.tax.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="text-align: right; color: #666;">Shipping:</td>
                          <td style="text-align: right; color: green;">FREE</td>
                        </tr>
                        <tr style="border-top: 2px solid #1b4332;">
                          <td style="text-align: right; color: #1b4332; font-size: 18px; font-weight: bold; padding-top: 10px;">Total:</td>
                          <td style="text-align: right; color: #1b4332; font-size: 18px; font-weight: bold; padding-top: 10px;">₱${orderDetails.total.toFixed(2)}</td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <h3 style="color: #1b4332; margin: 0 0 10px 0; font-size: 16px;">Delivery Address</h3>
                            <p style="color: #333; margin: 0; line-height: 1.6;">
                              ${orderDetails.address.street}<br>
                              ${orderDetails.address.barangay ? orderDetails.address.barangay + ', ' : ''}${orderDetails.address.city}<br>
                              ${orderDetails.address.province} ${orderDetails.address.zipCode}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #1b4332; border-radius: 8px; padding: 16px 32px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deliveries" style="color: #c9e265; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                              Track Your Order
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        You can track your order status in your dashboard. We'll notify you when your order status changes.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendOrderStatusEmail(email: string, statusDetails: any) {
  const statusMessages: Record<string, { title: string; message: string; icon: string }> = {
    confirmed: {
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and will be prepared soon.',
      icon: '✅'
    },
    preparing: {
      title: 'Preparing Your Order',
      message: 'Your medicine is being carefully prepared and packed.',
      icon: '📦'
    },
    ready: {
      title: 'Ready for Delivery',
      message: 'Your order is ready and will be assigned to a rider soon.',
      icon: '✓'
    },
    rider_received: {
      title: 'Rider Received Order',
      message: 'Our rider has received your order and will deliver it soon.',
      icon: '🏍️'
    },
    out_for_delivery: {
      title: 'Out for Delivery',
      message: 'Your order is on the way!',
      icon: '🚚'
    },
    delivered: {
      title: 'Delivered Successfully',
      message: 'Your order has been delivered. Thank you for choosing DoorMedExpress!',
      icon: '🎉'
    }
  }

  const status = statusMessages[statusDetails.status] || statusMessages.confirmed

  await sendEmail({
    to: email,
    subject: `${status.icon} ${status.title} - Order #${statusDetails.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">${status.icon}</div>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic; text-align: center;">${status.title}</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                        ${status.message}
                      </p>
                      
                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <p style="color: #333; margin: 8px 0;"><strong>Order Number:</strong> ${statusDetails.orderNumber}</p>
                            ${statusDetails.estimatedDelivery ? `<p style="color: #333; margin: 8px 0;"><strong>Estimated Delivery:</strong> ${statusDetails.estimatedDelivery}</p>` : ''}
                            ${statusDetails.riderName ? `<p style="color: #333; margin: 8px 0;"><strong>Rider:</strong> ${statusDetails.riderName}</p>` : ''}
                          </td>
                        </tr>
                      </table>

                      <table cellpadding="0" cellspacing="0" style="margin: 30px auto; display: block; width: fit-content;">
                        <tr>
                          <td style="background-color: #1b4332; border-radius: 8px; padding: 16px 32px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deliveries" style="color: #c9e265; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                              Track Your Order
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendSubscriptionReceiptEmail(email: string, subscriptionDetails: any) {
  const planNames: Record<string, string> = {
    one_time: 'One-Time Trial',
    monthly: '30 Days Monthly',
    semi_annual: 'Semi-Annual (6 months)',
    annual: 'Annual (12 months)'
  }

  await sendEmail({
    to: email,
    subject: `Subscription Confirmed - DoorMedExpress`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f7e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f7e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; padding: 40px;">
                  <tr>
                    <td>
                      <h1 style="color: #1b4332; margin: 0 0 20px 0; font-size: 32px; font-style: italic;">Subscription Confirmed! 🎉</h1>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you for subscribing! Your subscription has been successfully set up.
                      </p>
                      
                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <h2 style="color: #1b4332; margin: 0 0 15px 0; font-size: 20px;">Subscription Details</h2>
                            <p style="color: #333; margin: 8px 0;"><strong>Subscription ID:</strong> ${subscriptionDetails.subscriptionId}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Plan:</strong> ${planNames[subscriptionDetails.planType] || subscriptionDetails.planType}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Frequency:</strong> Every ${subscriptionDetails.frequency} days</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Next Delivery:</strong> ${subscriptionDetails.nextDeliveryDate}</p>
                            <p style="color: #333; margin: 8px 0;"><strong>Payment Method:</strong> ${subscriptionDetails.paymentMethod} ending in ${subscriptionDetails.cardLast4}</p>
                          </td>
                        </tr>
                      </table>

                      <h3 style="color: #1b4332; margin: 30px 0 15px 0; font-size: 18px;">Subscription Items</h3>
                      <table width="100%" cellpadding="10" cellspacing="0" style="border-top: 2px solid #f2f7e8;">
                        ${subscriptionDetails.items.map((item: any) => `
                          <tr style="border-bottom: 1px solid #f2f7e8;">
                            <td style="padding: 15px 0;">
                              <strong style="color: #333;">${item.name}</strong>
                            </td>
                            <td style="text-align: center; color: #666;">x${item.quantity}</td>
                            <td style="text-align: right; color: #1b4332; font-weight: bold;">₱${item.price.toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </table>

                      <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0;">
                        <tr style="border-top: 2px solid #1b4332;">
                          <td style="text-align: right; color: #1b4332; font-size: 18px; font-weight: bold; padding-top: 10px;">Total per delivery:</td>
                          <td style="text-align: right; color: #1b4332; font-size: 18px; font-weight: bold; padding-top: 10px; width: 100px;">₱${subscriptionDetails.total.toFixed(2)}</td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f2f7e8; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <h3 style="color: #1b4332; margin: 0 0 10px 0; font-size: 16px;">Delivery Address</h3>
                            <p style="color: #333; margin: 0; line-height: 1.6;">
                              ${subscriptionDetails.address.street}<br>
                              ${subscriptionDetails.address.barangay ? subscriptionDetails.address.barangay + ', ' : ''}${subscriptionDetails.address.city}<br>
                              ${subscriptionDetails.address.province} ${subscriptionDetails.address.zipCode}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #e8f5e9; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td>
                            <h3 style="color: #1b4332; margin: 0 0 10px 0; font-size: 16px;">Subscription Benefits</h3>
                            <ul style="margin: 10px 0; padding-left: 20px; color: #333;">
                              <li style="margin: 8px 0;">Automatic refills - never run out</li>
                              <li style="margin: 8px 0;">Free delivery on all orders</li>
                              <li style="margin: 8px 0;">Cancel or modify anytime</li>
                              <li style="margin: 8px 0;">Priority customer support</li>
                            </ul>
                          </td>
                        </tr>
                      </table>

                      <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #1b4332; border-radius: 8px; padding: 16px 32px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions" style="color: #c9e265; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                              Manage Subscription
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        You can manage your subscription, update delivery preferences, or cancel anytime from your dashboard.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}
