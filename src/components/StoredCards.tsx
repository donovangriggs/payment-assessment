import type { StoredCard } from '../types/payment'
import { StoredCardTile } from './StoredCardTile'

interface StoredCardsProps {
  readonly cards: readonly StoredCard[]
  readonly selectedCardId: string | null
  readonly onSelect: (cardId: string | null) => void
  readonly onDelete: (cardId: string) => void
}

export function StoredCards({ cards, selectedCardId, onSelect, onDelete }: StoredCardsProps) {
  function handleSelect(cardId: string) {
    onSelect(selectedCardId === cardId ? null : cardId)
  }

  return (
    <section className="mb-8" aria-label="Saved cards">
      <h2 className="font-sans font-medium text-xs uppercase tracking-wide text-text-secondary mb-4">
        Your Cards
      </h2>
      {cards.length === 0 ? (
        <p className="text-base text-text-muted p-6 text-center bg-bg-surface rounded-sm">
          No saved cards
        </p>
      ) : (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
          role="radiogroup"
          aria-label="Select a saved card"
        >
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
