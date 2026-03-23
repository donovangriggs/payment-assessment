import { useRef, useState, useEffect } from 'react'
import type { IframeEventType, FieldError, TokenizedCard, PaymentFlowState } from '../types/payment'
import { usePostMessage } from '../hooks/usePostMessage'

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

  const VALID_SCHEMES = new Set<string>(['visa', 'mastercard', 'unknown'])

  const handlers: Partial<Record<IframeEventType, (payload: Record<string, unknown>) => void>> = {
    CARD_IFRAME_READY: () => {
      setIframeState('ready')
      onFlowStateChange('iframe-ready')
      sendMessage('INJECT_STYLES', { styles: getInjectedStyles() })
    },
    STYLES_APPLIED: () => {
      setIframeState('styled')
      onFlowStateChange('styles-applied')
    },
    VALIDATION_ERROR: (payload) => {
      if (!Array.isArray(payload.errors)) return
      onValidationError(payload.errors as FieldError[])
      onFlowStateChange('styles-applied')
    },
    CARD_TOKENIZED: (payload) => {
      const { token, maskedPan, expiry, scheme } = payload
      if (
        typeof token !== 'string' || !token ||
        typeof maskedPan !== 'string' ||
        typeof expiry !== 'string' ||
        typeof scheme !== 'string' || !VALID_SCHEMES.has(scheme)
      ) {
        return
      }
      onTokenized({ token, maskedPan, expiry, scheme: scheme as TokenizedCard['scheme'] })
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
    <section className="mb-8" aria-label="Card details">
      <h2 className="font-sans font-medium text-xs uppercase tracking-wide text-text-secondary mb-4">
        Card Details
      </h2>
      {iframeState === 'loading' && (
        <div className="flex flex-col gap-2">
          <div className="h-14 bg-bg-surface rounded-sm animate-pulse" />
          <div className="h-14 bg-bg-surface rounded-sm animate-pulse" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 bg-bg-surface rounded-sm animate-pulse" />
            <div className="h-14 bg-bg-surface rounded-sm animate-pulse" />
          </div>
        </div>
      )}
      {iframeState === 'error' && (
        <div className="p-6 bg-error/8 border-l-3 border-error rounded-sm text-error text-sm" role="alert">
          Unable to load payment form. Please refresh.
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/card-iframe.html"
        title="Card payment form"
        className={`w-full border-none bg-transparent min-h-[300px] block overflow-hidden ${
          iframeState === 'loading' || iframeState === 'error'
            ? 'absolute w-px h-px overflow-hidden [clip:rect(0,0,0,0)]'
            : ''
        }`}
        sandbox="allow-scripts allow-same-origin"
      />
    </section>
  )
}
