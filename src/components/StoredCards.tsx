import { useRef, useCallback } from 'react'
import type { StoredCard } from '../types/payment'
import { StoredCardTile } from './StoredCardTile'

interface StoredCardsProps {
  readonly cards: readonly StoredCard[]
  readonly selectedCardId: string | null
  readonly onSelect: (cardId: string | null) => void
  readonly onDelete: (cardId: string) => void
}

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)
  const hasDragged = useRef(false)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX
    scrollStart.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return
    const dx = e.pageX - startX.current
    if (Math.abs(dx) > 3) hasDragged.current = true
    ref.current.scrollLeft = scrollStart.current - dx
  }, [])

  const onMouseUp = useCallback(() => {
    if (!ref.current) return
    isDragging.current = false
    ref.current.style.cursor = 'grab'
    ref.current.style.userSelect = ''
  }, [])

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    isDragging.current = false
    ref.current.style.cursor = 'grab'
    ref.current.style.userSelect = ''
  }, [])

  // Suppress click if we dragged — prevents selecting a card on drag release
  const shouldIgnoreClick = useCallback(() => hasDragged.current, [])

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, shouldIgnoreClick }
}

export function StoredCards({ cards, selectedCardId, onSelect, onDelete }: StoredCardsProps) {
  const { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, shouldIgnoreClick } = useDragScroll()

  function handleSelect(cardId: string) {
    if (shouldIgnoreClick()) return
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
          ref={ref}
          className="flex gap-2 overflow-x-auto pb-1 cursor-grab [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          role="radiogroup"
          aria-label="Select a saved card"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
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
