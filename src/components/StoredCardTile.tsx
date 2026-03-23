import type { StoredCard } from '../types/payment'
import './StoredCardTile.css'

interface StoredCardTileProps {
  readonly card: StoredCard
  readonly isSelected: boolean
  readonly onSelect: (cardId: string) => void
  readonly onDelete: (cardId: string) => void
}

const SCHEME_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
}

const SCHEME_COLORS: Record<string, string> = {
  visa: '#1a73e8',
  mastercard: '#ff5f00',
}

export function StoredCardTile({ card, isSelected, onSelect, onDelete }: StoredCardTileProps) {
  const lastFour = card.maskedPan.slice(-4)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(card.id)
    }
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(card.id)
  }

  return (
    <div
      className={`stored-card-tile ${isSelected ? 'selected' : ''}`}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(card.id)}
      onKeyDown={handleKeyDown}
    >
      <button
        className="card-delete-btn"
        onClick={handleDelete}
        aria-label={`Delete ${SCHEME_LABELS[card.scheme] ?? 'card'} card ending in ${lastFour}`}
        type="button"
      >
        &times;
      </button>
      <span
        className="card-scheme"
        style={{ color: SCHEME_COLORS[card.scheme] ?? 'var(--text-secondary)' }}
      >
        {SCHEME_LABELS[card.scheme] ?? card.scheme}
      </span>
      <span className="card-pan">{card.maskedPan}</span>
      <span className="card-expiry">{card.expiry}</span>
    </div>
  )
}
