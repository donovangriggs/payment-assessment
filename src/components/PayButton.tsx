import { formatAmount, PAYMENT_AMOUNT, PAYMENT_CURRENCY } from '../services/mockApi'

interface PayButtonProps {
  readonly isProcessing: boolean
  readonly disabled: boolean
  readonly onClick: () => void
}

export function PayButton({ isProcessing, disabled, onClick }: PayButtonProps) {
  return (
    <button
      className="w-full py-4 px-6 min-h-12 bg-accent text-accent-text border-none rounded-full font-sans font-bold text-md cursor-pointer transition-all duration-150 ease-out flex items-center justify-center gap-2 hover:not-disabled:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
      disabled={disabled || isProcessing}
      aria-busy={isProcessing}
      onClick={onClick}
      type="button"
    >
      {isProcessing ? (
        <>
          <span
            className="w-[18px] h-[18px] border-2 border-accent-text border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          Processing...
        </>
      ) : (
        `Pay ${formatAmount(PAYMENT_AMOUNT, PAYMENT_CURRENCY)}`
      )}
    </button>
  )
}
