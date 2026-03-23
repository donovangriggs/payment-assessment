interface PaymentResultProps {
  readonly success: boolean
  readonly transactionId?: string
  readonly amount: string
  readonly error?: string
  readonly onReset: () => void
}

export function PaymentResult({ success, transactionId, amount, error, onReset }: PaymentResultProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      {success ? (
        <>
          <div className="text-success mb-2" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.12" />
              <path d="M16 24l6 6 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-sans font-bold text-[24px] text-text-primary">Payment successful</h2>
          {transactionId && (
            <p className="font-mono text-base text-text-secondary">{transactionId}</p>
          )}
          <p className="font-sans font-medium text-md text-text-primary">{amount}</p>
          <button
            className="mt-6 py-4 px-8 min-h-12 rounded-full font-sans font-bold text-md cursor-pointer bg-transparent text-text-primary border border-border transition-colors duration-150 ease-out hover:border-text-secondary focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            onClick={onReset}
            type="button"
          >
            Make another payment
          </button>
        </>
      ) : (
        <>
          <div className="text-error mb-2" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.12" />
              <path d="M18 18l12 12M30 18l-12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-sans font-bold text-[24px] text-text-primary">Payment declined</h2>
          {error && <p className="text-base text-text-secondary">{error}</p>}
          <button
            className="mt-6 py-4 px-8 min-h-12 rounded-full font-sans font-bold text-md cursor-pointer bg-accent text-accent-text border-none transition-colors duration-150 ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            onClick={onReset}
            type="button"
          >
            Try again
          </button>
        </>
      )}
    </div>
  )
}
