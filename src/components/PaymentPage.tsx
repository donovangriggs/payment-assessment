import { useState, useCallback } from 'react'
import type { PaymentFlowState, TokenizedCard, FieldError, StoredCard } from '../types/payment'
import { processPayment, formatAmount, PAYMENT_AMOUNT, PAYMENT_CURRENCY } from '../services/mockApi'
import { useStoredCards } from '../hooks/useStoredCards'
import { StoredCards } from './StoredCards'
import { CardIframe } from './CardIframe'
import { SaveCardToggle } from './SaveCardToggle'
import { PayButton } from './PayButton'
import { PaymentResult } from './PaymentResult'
import './PaymentPage.css'

export function PaymentPage() {
  const { cards, selectedCard, selectedCardId, selectCard, deleteCard, saveCard } = useStoredCards()

  const [flowState, setFlowState] = useState<PaymentFlowState>('iframe-loading')
  const [saveCardChecked, setSaveCardChecked] = useState(false)
  const [triggerTokenize, setTriggerTokenize] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    transactionId?: string
    error?: string
  } | null>(null)

  // Double-click prevention
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFlowStateChange = useCallback((state: PaymentFlowState) => {
    setFlowState(state)
  }, [])

  const handleTokenized = useCallback(
    async (tokenizedCard: TokenizedCard) => {
      setIsProcessing(true)
      setFlowState('processing')

      try {
        const result = await processPayment(PAYMENT_AMOUNT, PAYMENT_CURRENCY, tokenizedCard.token)

        if (result.success && saveCardChecked) {
          const newCard: StoredCard = {
            id: `card_${Date.now()}`,
            token: tokenizedCard.token,
            maskedPan: tokenizedCard.maskedPan,
            expiry: tokenizedCard.expiry,
            scheme: tokenizedCard.scheme,
          }
          saveCard(newCard)
        }

        setPaymentResult({
          success: result.success,
          transactionId: result.transactionId,
          error: result.error,
        })
        setFlowState(result.success ? 'success' : 'failure')
      } catch {
        setPaymentResult({
          success: false,
          error: 'An unexpected error occurred. Please try again.',
        })
        setFlowState('failure')
      } finally {
        setIsProcessing(false)
      }
    },
    [saveCardChecked, saveCard],
  )

  const handleValidationError = useCallback((_errors: readonly FieldError[]) => {
    setIsProcessing(false)
    // Errors are displayed inside the iframe
  }, [])

  const handleTokenizeHandled = useCallback(() => {
    setTriggerTokenize(false)
  }, [])

  async function handlePay() {
    if (isProcessing) return

    if (selectedCard) {
      // Pay with stored card — skip iframe entirely
      setIsProcessing(true)
      setFlowState('processing')
      try {
        const result = await processPayment(PAYMENT_AMOUNT, PAYMENT_CURRENCY, selectedCard.token)
        setPaymentResult({
          success: result.success,
          transactionId: result.transactionId,
          error: result.error,
        })
        setFlowState(result.success ? 'success' : 'failure')
      } catch {
        setPaymentResult({
          success: false,
          error: 'An unexpected error occurred. Please try again.',
        })
        setFlowState('failure')
      } finally {
        setIsProcessing(false)
      }
    } else {
      // Pay with new card — trigger iframe tokenization
      setIsProcessing(true)
      setTriggerTokenize(true)
    }
  }

  function handleReset() {
    setPaymentResult(null)
    setFlowState('styles-applied')
    setIsProcessing(false)
    setSaveCardChecked(false)
    selectCard(null)
  }

  // Show result screen when payment is complete
  if (paymentResult) {
    return (
      <div className="payment-page">
        <PaymentResult
          success={paymentResult.success}
          transactionId={paymentResult.transactionId}
          amount={formatAmount(PAYMENT_AMOUNT, PAYMENT_CURRENCY)}
          error={paymentResult.error}
          onReset={handleReset}
        />
      </div>
    )
  }

  const isPayDisabled =
    flowState === 'iframe-loading' ||
    flowState === 'idle' ||
    (flowState === 'iframe-ready' && !selectedCard)

  return (
    <div className="payment-page">
      <h1 className="payment-title">Payment</h1>
      <p className="payment-subtitle">
        {formatAmount(PAYMENT_AMOUNT, PAYMENT_CURRENCY)} — Fee included
      </p>

      <StoredCards
        cards={cards}
        selectedCardId={selectedCardId}
        onSelect={selectCard}
        onDelete={deleteCard}
      />

      <CardIframe
        hidden={selectedCard !== null}
        onTokenized={handleTokenized}
        onValidationError={handleValidationError}
        onFlowStateChange={handleFlowStateChange}
        triggerTokenize={triggerTokenize}
        onTokenizeHandled={handleTokenizeHandled}
      />

      {!selectedCard && (
        <SaveCardToggle
          checked={saveCardChecked}
          onChange={setSaveCardChecked}
        />
      )}

      <PayButton
        isProcessing={isProcessing}
        disabled={isPayDisabled}
        onClick={handlePay}
      />
    </div>
  )
}
