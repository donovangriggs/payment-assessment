import { useState, useCallback } from 'react'
import type { StoredCard } from '../types/payment'
import {
  loadStoredCards,
  addStoredCard,
  removeStoredCard,
} from '../services/storedCardsStorage'

export function useStoredCards() {
  const [cards, setCards] = useState<readonly StoredCard[]>(() => loadStoredCards())
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const selectCard = useCallback((cardId: string | null) => {
    setSelectedCardId(cardId)
  }, [])

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => {
      const updated = removeStoredCard(prev, cardId)
      return updated
    })
    setSelectedCardId((prev) => (prev === cardId ? null : prev))
  }, [])

  const saveCard = useCallback((card: StoredCard) => {
    setCards((prev) => addStoredCard(prev, card))
  }, [])

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null

  return {
    cards,
    selectedCard,
    selectedCardId,
    selectCard,
    deleteCard,
    saveCard,
  } as const
}
