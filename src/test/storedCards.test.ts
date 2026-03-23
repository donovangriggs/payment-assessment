import { describe, it, expect, beforeEach } from 'vitest'
import type { StoredCard } from '../types/payment'
import { loadStoredCards, saveStoredCards, addStoredCard, removeStoredCard } from '../services/storedCardsStorage'
import { DEFAULT_STORED_CARDS } from '../services/mockApi'

describe('storedCardsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads default cards on first run', () => {
    const cards = loadStoredCards()
    expect(cards).toHaveLength(2)
    expect(cards[0].scheme).toBe('visa')
    expect(cards[1].scheme).toBe('mastercard')
  })

  it('persists cards to localStorage', () => {
    const cards = [...DEFAULT_STORED_CARDS]
    saveStoredCards(cards)
    const loaded = loadStoredCards()
    expect(loaded).toEqual(cards)
  })

  it('adds a card immutably', () => {
    const original = loadStoredCards()
    const newCard: StoredCard = {
      id: 'card_new',
      token: 'tok_new',
      maskedPan: '4222 **** **** 0000',
      expiry: '03/29',
      scheme: 'visa',
    }
    const updated = addStoredCard(original, newCard)
    expect(updated).toHaveLength(3)
    expect(updated[2]).toEqual(newCard)
    // Original unchanged
    expect(original).toHaveLength(2)
  })

  it('removes a card immutably', () => {
    const original = loadStoredCards()
    const updated = removeStoredCard(original, 'card_1')
    expect(updated).toHaveLength(1)
    expect(updated[0].id).toBe('card_2')
    // Original unchanged
    expect(original).toHaveLength(2)
  })

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('payment_stored_cards', 'not json')
    const cards = loadStoredCards()
    expect(cards).toHaveLength(2) // Falls back to defaults
  })

  it('handles invalid data shape gracefully', () => {
    localStorage.setItem('payment_stored_cards', '[{"bad": true}]')
    const cards = loadStoredCards()
    expect(cards).toHaveLength(2) // Falls back to defaults
  })
})
