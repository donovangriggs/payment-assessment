import type { StoredCard } from '../types/payment'
import { DEFAULT_STORED_CARDS } from './mockApi'

// In production, stored card metadata (masked PAN, expiry, scheme) would come
// from the server via an API call, not localStorage. Only the token is truly
// client-safe. localStorage is used here as a mock of server-side card storage.

const STORAGE_KEY = 'payment_stored_cards'

function isStoredCardArray(value: unknown): value is StoredCard[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.token === 'string' &&
        typeof item.maskedPan === 'string' &&
        typeof item.expiry === 'string' &&
        typeof item.scheme === 'string',
    )
  )
}

export function loadStoredCards(): readonly StoredCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      // First load — seed with defaults
      saveStoredCards([...DEFAULT_STORED_CARDS])
      return DEFAULT_STORED_CARDS
    }
    const parsed: unknown = JSON.parse(raw)
    if (isStoredCardArray(parsed)) {
      return parsed
    }
    // Corrupt data — reset to defaults
    saveStoredCards([...DEFAULT_STORED_CARDS])
    return DEFAULT_STORED_CARDS
  } catch {
    // localStorage unavailable (private browsing) or corrupt JSON
    return DEFAULT_STORED_CARDS
  }
}

export function saveStoredCards(cards: readonly StoredCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch {
    // localStorage unavailable — silently fail
  }
}

export function addStoredCard(
  cards: readonly StoredCard[],
  card: StoredCard,
): readonly StoredCard[] {
  const updated = [...cards, card]
  saveStoredCards(updated)
  return updated
}

export function removeStoredCard(
  cards: readonly StoredCard[],
  cardId: string,
): readonly StoredCard[] {
  const updated = cards.filter((c) => c.id !== cardId)
  saveStoredCards(updated)
  return updated
}
