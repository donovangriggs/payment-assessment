import { describe, it, expect } from 'vitest'

// These functions mirror the iframe's validation logic.
// In a real project, shared validation would be extracted to a shared module.
// Here we test the logic directly to verify correctness.

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false

  let sum = 0
  let alternate = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

function detectScheme(pan: string): 'visa' | 'mastercard' | 'unknown' {
  const digits = pan.replace(/\D/g, '')
  if (!digits) return 'unknown'
  if (digits[0] === '4') return 'visa'
  const twoDigit = parseInt(digits.slice(0, 2), 10)
  const fourDigit = parseInt(digits.slice(0, 4), 10)
  if (twoDigit >= 51 && twoDigit <= 55) return 'mastercard'
  if (fourDigit >= 2221 && fourDigit <= 2720) return 'mastercard'
  return 'unknown'
}

function formatPan(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2)
  }
  return digits
}

describe('Luhn check', () => {
  it('validates known good Visa number', () => {
    expect(luhnCheck('4111111111111111')).toBe(true)
  })

  it('validates known good Mastercard number', () => {
    expect(luhnCheck('5425233430109903')).toBe(true)
  })

  it('validates test decline card', () => {
    expect(luhnCheck('4000000000000002')).toBe(true)
  })

  it('rejects invalid card number', () => {
    expect(luhnCheck('1234567890123456')).toBe(false)
  })

  it('rejects too short number', () => {
    expect(luhnCheck('411111')).toBe(false)
  })

  it('rejects too long number', () => {
    expect(luhnCheck('41111111111111111111')).toBe(false)
  })

  it('handles formatted number with spaces', () => {
    expect(luhnCheck('4111 1111 1111 1111')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(luhnCheck('')).toBe(false)
  })
})

describe('Card scheme detection', () => {
  it('detects Visa (starts with 4)', () => {
    expect(detectScheme('4111111111111111')).toBe('visa')
  })

  it('detects Mastercard (51-55 range)', () => {
    expect(detectScheme('5425233430109903')).toBe('mastercard')
  })

  it('detects Mastercard (2221-2720 range)', () => {
    expect(detectScheme('2221000000000000')).toBe('mastercard')
    expect(detectScheme('2720000000000000')).toBe('mastercard')
  })

  it('returns unknown for unrecognized prefix', () => {
    expect(detectScheme('6011000000000000')).toBe('unknown')
  })

  it('returns unknown for empty string', () => {
    expect(detectScheme('')).toBe('unknown')
  })

  it('works with formatted input', () => {
    expect(detectScheme('4111 1111 1111 1111')).toBe('visa')
  })
})

describe('Card number formatting', () => {
  it('adds spaces every 4 digits', () => {
    expect(formatPan('4111111111111111')).toBe('4111 1111 1111 1111')
  })

  it('handles partial input', () => {
    expect(formatPan('411111')).toBe('4111 11')
  })

  it('strips non-digits', () => {
    expect(formatPan('4111-1111-1111')).toBe('4111 1111 1111')
  })

  it('limits to 19 digits', () => {
    expect(formatPan('41111111111111111111111')).toBe('4111 1111 1111 1111 111')
  })
})

describe('Expiry formatting', () => {
  it('formats MM/YY', () => {
    expect(formatExpiry('1228')).toBe('12/28')
  })

  it('returns digits only for short input', () => {
    expect(formatExpiry('1')).toBe('1')
    expect(formatExpiry('12')).toBe('12')
  })

  it('limits to 4 digits', () => {
    expect(formatExpiry('12289')).toBe('12/28')
  })

  it('strips non-digits', () => {
    expect(formatExpiry('12/28')).toBe('12/28')
  })
})
