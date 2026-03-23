import { formatAmount, PAYMENT_AMOUNT, PAYMENT_CURRENCY } from '../services/mockApi'
import './PayButton.css'

interface PayButtonProps {
  readonly isProcessing: boolean
  readonly disabled: boolean
  readonly onClick: () => void
}

export function PayButton({ isProcessing, disabled, onClick }: PayButtonProps) {
  return (
    <button
      className="pay-button"
      disabled={disabled || isProcessing}
      aria-busy={isProcessing}
      onClick={onClick}
      type="button"
    >
      {isProcessing ? (
        <>
          <span className="pay-spinner" aria-hidden="true" />
          Processing...
        </>
      ) : (
        `Pay ${formatAmount(PAYMENT_AMOUNT, PAYMENT_CURRENCY)}`
      )}
    </button>
  )
}
