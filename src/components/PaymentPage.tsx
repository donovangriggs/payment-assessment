import { useState, useCallback } from 'react'
import type { PaymentFlowState, TokenizedCard, FieldError, StoredCard } from '../types/payment'
import { processPayment, formatAmount, PAYMENT_AMOUNT, PAYMENT_CURRENCY } from '../services/mockApi'
import { useStoredCards } from '../hooks/useStoredCards'
import { StoredCards } from './StoredCards'
import { CardIframe } from './CardIframe'
import { SaveCardToggle } from './SaveCardToggle'
import { PayButton } from './PayButton'
import { PaymentResult } from './PaymentResult'

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
  }, [])

  const handleTokenizeHandled = useCallback(() => {
    setTriggerTokenize(false)
  }, [])

  async function handlePay() {
    if (isProcessing) return

    if (selectedCard) {
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

  if (paymentResult) {
    return (
      <div className="w-full max-w-[440px]">
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
    <div className="w-full max-w-[440px]">
      <h1 className="font-sans font-bold text-xl text-text-primary mb-1">Payment</h1>
      <p className="font-sans text-base text-text-secondary mb-8">
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
