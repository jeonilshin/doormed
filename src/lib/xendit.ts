import Xendit from 'xendit-node'

let xenditClient: any = null

if (process.env.XENDIT_SECRET_KEY) {
  xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY,
  })
}

export default xenditClient

// Helper function to create a payment charge
export async function createPaymentCharge(params: {
  amount: number
  currency: string
  referenceId: string
  description: string
  cardToken: string
  customerEmail: string
}) {
  try {
    if (!xenditClient) {
      throw new Error('Xendit is not configured')
    }
    
    const { Card } = xenditClient as any
    const cardCharge = new Card({})

    const charge = await cardCharge.createCharge({
      token_id: params.cardToken,
      external_id: params.referenceId,
      amount: params.amount,
      authentication_id: undefined,
      card_cvn: undefined,
      capture: true,
    })

    return {
      success: true,
      charge,
    }
  } catch (error: any) {
    console.error('Xendit payment error:', error)
    return {
      success: false,
      error: error.message || 'Payment failed',
    }
  }
}

// Helper function to tokenize card
export async function tokenizeCard(params: {
  cardNumber: string
  cardExpMonth: string
  cardExpYear: string
  cardCvn: string
  isMultipleUse?: boolean
}) {
  try {
    if (!xenditClient) {
      throw new Error('Xendit is not configured')
    }
    
    const { Card } = xenditClient as any
    const card = new Card({})

    const token = await card.createToken({
      card_number: params.cardNumber,
      card_exp_month: params.cardExpMonth,
      card_exp_year: params.cardExpYear,
      card_cvn: params.cardCvn,
      is_multiple_use: params.isMultipleUse || false,
    })

    return {
      success: true,
      token,
    }
  } catch (error: any) {
    console.error('Xendit tokenization error:', error)
    return {
      success: false,
      error: error.message || 'Card tokenization failed',
    }
  }
}
