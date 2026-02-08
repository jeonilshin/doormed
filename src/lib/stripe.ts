import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
  })
}

export async function createCustomer(email: string, name: string) {
  return await stripe.customers.create({
    email,
    name,
  })
}

export async function createSubscription(customerId: string, priceId: string) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function attachPaymentMethod(customerId: string, paymentMethodId: string) {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
}
