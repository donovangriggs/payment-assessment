import type { StoredCard } from '../types/payment'

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
      className={`relative flex flex-col gap-2 p-6 bg-bg-surface border-2 rounded-sm min-w-[180px] cursor-pointer select-none transition-colors duration-250 ease-out hover:bg-bg-surface-alt focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
        isSelected ? 'border-accent' : 'border-transparent'
      }`}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(card.id)}
      onKeyDown={handleKeyDown}
    >
      <button
        className="absolute top-2 right-2 bg-transparent border-none text-text-muted text-lg cursor-pointer p-1 leading-none rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-150 ease-out hover:text-error focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        onClick={handleDelete}
        aria-label={`Delete ${SCHEME_LABELS[card.scheme] ?? 'card'} card ending in ${lastFour}`}
        type="button"
      >
        &times;
      </button>
      <span
        className="font-sans font-bold text-sm uppercase tracking-wide"
        style={{ color: SCHEME_COLORS[card.scheme] ?? 'var(--color-text-secondary)' }}
      >
        {SCHEME_LABELS[card.scheme] ?? card.scheme}
      </span>
      <span className="font-mono text-sm text-text-primary">{card.maskedPan}</span>
      <span className="font-mono text-xs text-text-secondary">{card.expiry}</span>
    </div>
  )
}
