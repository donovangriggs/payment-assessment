import { useEffect, useCallback, useRef } from 'react'
import type { IframeMessage, IframeEventType } from '../types/payment'

// In production, the iframe would be served from a different origin
// (e.g., cards.wardenpay.com), making contentDocument inaccessible.
// This mock demonstrates the postMessage protocol pattern used in
// real PCI-compliant hosted payment pages.
const TRUSTED_ORIGIN = window.location.origin

type MessageHandler = (payload: Record<string, unknown>) => void

export function usePostMessage(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  handlers: Partial<Record<IframeEventType, MessageHandler>>,
) {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== TRUSTED_ORIGIN) {
        return
      }

      const data = event.data as IframeMessage | undefined
      if (!data || typeof data.type !== 'string') {
        return
      }

      const handler = handlersRef.current[data.type as IframeEventType]
      if (handler) {
        handler(data.payload ?? {})
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const sendMessage = useCallback(
    (type: IframeEventType, payload: Record<string, unknown> = {}) => {
      const iframe = iframeRef.current
      if (!iframe?.contentWindow) {
        return
      }
      const message: IframeMessage = { type, payload }
      iframe.contentWindow.postMessage(message, TRUSTED_ORIGIN)
    },
    [iframeRef],
  )

  return { sendMessage }
}
