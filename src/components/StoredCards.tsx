import type { StoredCard } from '../types/payment'
import { StoredCardTile } from './StoredCardTile'
import './StoredCards.css'

interface StoredCardsProps {
  readonly cards: readonly StoredCard[]
  readonly selectedCardId: string | null
  readonly onSelect: (cardId: string | null) => void
  readonly onDelete: (cardId: string) => void
}

export function StoredCards({ cards, selectedCardId, onSelect, onDelete }: StoredCardsProps) {
  function handleSelect(cardId: string) {
    // Toggle: clicking the selected card deselects it
    onSelect(selectedCardId === cardId ? null : cardId)
  }

  return (
    <section className="stored-cards" aria-label="Saved cards">
      <h2 className="section-label">Your Cards</h2>
      {cards.length === 0 ? (
        <p className="stored-cards-empty">No saved cards</p>
      ) : (
        <div className="stored-cards-row" role="radiogroup" aria-label="Select a saved card">
          {cards.map((card) => (
            <StoredCardTile
              key={card.id}
              card={card}
              isSelected={selectedCardId === card.id}
              onSelect={handleSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
