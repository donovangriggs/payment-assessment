import './PaymentResult.css'

interface PaymentResultProps {
  readonly success: boolean
  readonly transactionId?: string
  readonly amount: string
  readonly error?: string
  readonly onReset: () => void
}

export function PaymentResult({ success, transactionId, amount, error, onReset }: PaymentResultProps) {
  return (
    <div className="payment-result">
      {success ? (
        <>
          <div className="result-icon success-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.12" />
              <path d="M16 24l6 6 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="result-heading">Payment successful</h2>
          {transactionId && (
            <p className="result-transaction">{transactionId}</p>
          )}
          <p className="result-amount">{amount}</p>
          <button className="result-button secondary" onClick={onReset} type="button">
            Make another payment
          </button>
        </>
      ) : (
        <>
          <div className="result-icon error-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.12" />
              <path d="M18 18l12 12M30 18l-12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="result-heading">Payment declined</h2>
          {error && <p className="result-error">{error}</p>}
          <button className="result-button primary" onClick={onReset} type="button">
            Try again
          </button>
        </>
      )}
    </div>
  )
}
