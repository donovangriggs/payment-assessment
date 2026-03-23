export interface StoredCard {
  readonly id: string;
  readonly token: string;
  readonly maskedPan: string;
  readonly expiry: string;
  readonly scheme: CardScheme;
}

export type CardScheme = 'visa' | 'mastercard' | 'unknown';

export interface PaymentResult {
  readonly success: boolean;
  readonly transactionId?: string;
  readonly error?: string;
}

export interface FieldError {
  readonly field: 'pan' | 'expiry' | 'cvv' | 'name';
  readonly message: string;
}

/** postMessage event types for iframe <-> main page communication */
export type IframeEventType =
  | 'CARD_IFRAME_READY'
  | 'INJECT_STYLES'
  | 'STYLES_APPLIED'
  | 'TOKENIZE_CARD'
  | 'VALIDATION_ERROR'
  | 'CARD_TOKENIZED';

export interface IframeMessage {
  readonly type: IframeEventType;
  readonly payload: Record<string, unknown>;
}

export interface TokenizedCard {
  readonly token: string;
  readonly maskedPan: string;
  readonly expiry: string;
  readonly scheme: CardScheme;
}

export type PaymentFlowState =
  | 'idle'
  | 'iframe-loading'
  | 'iframe-ready'
  | 'styles-applied'
  | 'processing'
  | 'success'
  | 'failure';
