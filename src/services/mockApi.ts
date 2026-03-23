import type { PaymentResult, StoredCard } from '../types/payment'

// Amount and currency are defined as constants, NOT from URL params.
// In production, these come from the merchant server session, not client-controlled input.
export const PAYMENT_AMOUNT = 10000 // cents (100.00 EUR)
export const PAYMENT_CURRENCY = 'EUR'

export function formatAmount(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

// Test card that always triggers a decline from the payment processor.
// It passes Luhn validation in the iframe but processPayment rejects it.
const DECLINE_TOKEN = 'tok_decline_0002'

export const DEFAULT_STORED_CARDS: readonly StoredCard[] = [
  {
    id: 'card_1',
    token: 'tok_visa_2487',
    maskedPan: '4111 **** **** 1111',
    expiry: '12/28',
    scheme: 'visa',
  },
  {
    id: 'card_2',
    token: 'tok_mc_8291',
    maskedPan: '5425 **** **** 3742',
    expiry: '06/27',
    scheme: 'mastercard',
  },
] as const

/**
 * Process a payment using a card token.
 * In production, this would call the payment gateway API.
 * Simulates 1-2s network latency.
 */
export async function processPayment(
  _amount: number,
  _currency: string,
  token: string,
): Promise<PaymentResult> {
  const delay = 1000 + Math.random() * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  if (token === DECLINE_TOKEN) {
    return {
      success: false,
      error: 'Payment declined — insufficient funds',
    }
  }

  return {
    success: true,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  }
}
