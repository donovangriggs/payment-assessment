import { useRef, useState, useEffect } from 'react'
import type { IframeEventType, FieldError, TokenizedCard, PaymentFlowState } from '../types/payment'
import { usePostMessage } from '../hooks/usePostMessage'
import './CardIframe.css'

const IFRAME_TIMEOUT_MS = 5000

interface CardIframeProps {
  readonly hidden: boolean
  readonly onTokenized: (card: TokenizedCard) => void
  readonly onValidationError: (errors: readonly FieldError[]) => void
  readonly onFlowStateChange: (state: PaymentFlowState) => void
  readonly triggerTokenize: boolean
  readonly onTokenizeHandled: () => void
}

/** CSS injected into the iframe to match the main page's design system */
function getInjectedStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap');

    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 14px;
      background: transparent;
      color: #ffffff;
    }

    .form-group { margin-bottom: 8px; }

    .form-field {
      width: 100%;
      padding: 24px 16px 8px;
      border: none;
      border-radius: 12px;
      background: #2a2a2a;
      color: #ffffff;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 16px;
      outline: none;
      transition: box-shadow 150ms ease-out;
    }

    .form-field:focus { box-shadow: 0 0 0 1px #d4ff00; }
    .form-field.error { box-shadow: 0 0 0 1px #ff4d4d; }
    .form-field::placeholder { color: transparent; }

    #pan {
      font-family: 'Geist Mono', ui-monospace, monospace;
      letter-spacing: 1px;
    }

    label {
      position: absolute;
      top: 16px;
      left: 16px;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666666;
      pointer-events: none;
      transition: transform 150ms ease-out, font-size 150ms ease-out;
      transform-origin: top left;
    }

    .form-field:focus + label,
    .form-field:not(:placeholder-shown) + label {
      transform: translateY(-8px);
      font-size: 10px;
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .error-message {
      font-size: 12px;
      color: #ff4d4d;
      margin-top: 4px;
    }

    .scheme-icon { font-family: 'DM Sans', system-ui, sans-serif; }
  `
}

export function CardIframe({
  hidden,
  onTokenized,
  onValidationError,
  onFlowStateChange,
  triggerTokenize,
  onTokenizeHandled,
}: CardIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeState, setIframeState] = useState<'loading' | 'ready' | 'styled' | 'error'>('loading')

  const handlers: Partial<Record<IframeEventType, (payload: Record<string, unknown>) => void>> = {
    CARD_IFRAME_READY: () => {
      console.log('[main] iframe ready')
      setIframeState('ready')
      onFlowStateChange('iframe-ready')
      sendMessage('INJECT_STYLES', { styles: getInjectedStyles() })
    },
    STYLES_APPLIED: () => {
      console.log('[main] Styles applied')
      setIframeState('styled')
      onFlowStateChange('styles-applied')
    },
    VALIDATION_ERROR: (payload) => {
      const errors = payload.errors as FieldError[]
      onValidationError(errors)
      onFlowStateChange('styles-applied')
    },
    CARD_TOKENIZED: (payload) => {
      const card: TokenizedCard = {
        token: payload.token as string,
        maskedPan: payload.maskedPan as string,
        expiry: payload.expiry as string,
        scheme: payload.scheme as TokenizedCard['scheme'],
      }
      console.log('[main] Card tokenized:', card.maskedPan)
      onTokenized(card)
    },
  }

  const { sendMessage } = usePostMessage(iframeRef, handlers)

  // Iframe ready timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeState((current) => {
        if (current === 'loading') {
          onFlowStateChange('idle')
          return 'error'
        }
        return current
      })
    }, IFRAME_TIMEOUT_MS)

    return () => clearTimeout(timer)
  }, [onFlowStateChange])

  // Handle tokenize trigger from parent
  const prevTrigger = useRef(triggerTokenize)
  useEffect(() => {
    if (triggerTokenize && !prevTrigger.current && iframeState === 'styled') {
      sendMessage('TOKENIZE_CARD')
      onTokenizeHandled()
    }
    prevTrigger.current = triggerTokenize
  }, [triggerTokenize, iframeState, sendMessage, onTokenizeHandled])

  if (hidden) return null

  return (
    <section className="card-iframe-section" aria-label="Card details">
      <h2 className="section-label">Card Details</h2>
      {iframeState === 'loading' && (
        <div className="iframe-skeleton">
          <div className="skeleton-field" />
          <div className="skeleton-field" />
          <div className="skeleton-row">
            <div className="skeleton-field" />
            <div className="skeleton-field" />
          </div>
        </div>
      )}
      {iframeState === 'error' && (
        <div className="iframe-error" role="alert">
          Unable to load payment form. Please refresh.
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/card-iframe.html"
        title="Card payment form"
        className={`card-iframe ${iframeState === 'loading' ? 'iframe-hidden' : ''} ${iframeState === 'error' ? 'iframe-hidden' : ''}`}
        sandbox="allow-scripts allow-same-origin"
      />
    </section>
  )
}
