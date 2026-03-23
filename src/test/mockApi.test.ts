import { describe, it, expect } from 'vitest'
import { processPayment, formatAmount, PAYMENT_AMOUNT, PAYMENT_CURRENCY } from '../services/mockApi'

describe('formatAmount', () => {
  it('formats cents to decimal with currency', () => {
    expect(formatAmount(10000, 'EUR')).toBe('100.00 EUR')
  })

  it('formats small amounts', () => {
    expect(formatAmount(99, 'USD')).toBe('0.99 USD')
  })

  it('formats zero', () => {
    expect(formatAmount(0, 'EUR')).toBe('0.00 EUR')
  })
})

describe('payment constants', () => {
  it('has correct default amount', () => {
    expect(PAYMENT_AMOUNT).toBe(10000)
  })

  it('has correct default currency', () => {
    expect(PAYMENT_CURRENCY).toBe('EUR')
  })
})

describe('processPayment', () => {
  it('returns success for valid token', async () => {
    const result = await processPayment(10000, 'EUR', 'tok_valid_123')
    expect(result.success).toBe(true)
    expect(result.transactionId).toBeDefined()
    expect(result.transactionId).toMatch(/^txn_/)
  })

  it('returns decline for decline token', async () => {
    const result = await processPayment(10000, 'EUR', 'tok_decline_0002')
    expect(result.success).toBe(false)
    expect(result.error).toContain('declined')
  })
})
