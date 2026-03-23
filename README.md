# Card Payment Page — Technical Assessment

A mocked card payment page demonstrating **PCI-compliant iframe isolation**. The main page (React + TypeScript + Tailwind) communicates with an embedded vanilla HTML iframe via `postMessage` — sensitive card data never touches the main page's DOM or JavaScript scope.

## Architecture

```
┌─────────────────────────────────────────┐
│  Main Page (React + TypeScript)         │
│  - Stored card tiles                    │
│  - Pay button                           │
│  - Save card toggle                     │
│  - Payment result screens               │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Card iframe (vanilla HTML/JS)    │  │
│  │  - Cardholder name, PAN, expiry,  │  │
│  │    CVV fields                     │  │
│  │  - Validation (Luhn, expiry)      │  │
│  │  - Mock tokenization              │  │
│  │  - postMessage communication      │  │
│  └───────────────────────────────────┘  │
│           ▲              │              │
│           │  postMessage │              │
│           └──────────────┘              │
└─────────────────────────────────────────┘
```

The iframe is a separate HTML file (`public/card-iframe.html`) — not a React component. In production, it would be served from a different origin (e.g., `cards.wardenpay.com`), making `contentDocument` inaccessible from the main page. This mock demonstrates the protocol pattern.

## Quick Start

```bash
nvm use          # Uses Node 24 (see .nvmrc)
npm install
npm run dev      # Opens at http://localhost:5173
```

To run tests:

```bash
npm run build    # Type check + production build
npx vitest run   # 35 unit tests
```

## Payment Flow

The flow minimises PCI scope by isolating card data inside the iframe:

| Step | Requirement | Implementation |
|------|-------------|----------------|
| 1 | Main page loads stored cards + save card toggle | `useStoredCards` hook loads from localStorage on init. `SaveCardToggle` component rendered below the card form. Default seed: 2 mock cards (Visa + Mastercard). |
| 2 | iframe loaded with styling injected from main page | `CardIframe` sends CSS string via `INJECT_STYLES` postMessage. The iframe receives it, injects a `<style>` tag, and confirms with `STYLES_APPLIED`. |
| 3 | User fills in card details and clicks Pay on main page | Card fields (name, PAN, expiry, CVV) live inside the iframe. The "Pay" button lives on the main page in `PayButton`. |
| 4 | Validation event sent from main page → iframe | Main page sends `TOKENIZE_CARD` via postMessage. The iframe receives it and runs `validateForm()` against its own DOM fields. |
| 5 | If valid, iframe tokenises the card (mocked) | Iframe calls `generateToken()` — produces a `tok_*` token + masked PAN. No real API call. |
| 6 | Card token returned from iframe → main page (mocked) | Iframe sends `CARD_TOKENIZED` with `{ token, maskedPan, expiry, scheme }` via postMessage. Main page receives it in `CardIframe` and passes to `PaymentPage`. |
| 7 | Main page does payment request with amount + token (mocked) | `processPayment(amount, currency, token)` in `mockApi.ts` simulates a 1-2s delay and returns success or failure. |

If the user selects a stored card instead of entering new details, the iframe is bypassed entirely — the main page uses the stored token directly for the payment request.

If the user selects a stored card instead of entering new details, the iframe is bypassed entirely — the main page uses the stored token directly for the payment request.

## postMessage Protocol

| Event | Direction | Purpose |
|-------|-----------|---------|
| `CARD_IFRAME_READY` | iframe → main | iframe loaded, ready for styling |
| `INJECT_STYLES` | main → iframe | Send CSS to match merchant branding |
| `STYLES_APPLIED` | iframe → main | Confirm styles applied |
| `TOKENIZE_CARD` | main → iframe | Trigger validation + tokenization |
| `VALIDATION_ERROR` | iframe → main | Field-level validation failures |
| `CARD_TOKENIZED` | iframe → main | Token + masked PAN (never raw card data) |

All `message` event listeners validate `event.origin` before processing. In dev, both pages share `localhost:5173` — in production, the iframe would be served from a separate origin.

## Test Cases

### 1. Successful new card payment
1. Leave stored cards unselected
2. Enter: Name "John Doe", Card `4111 1111 1111 1111`, Expiry `12/28`, CVV `123`
3. Toggle "Save card" ON
4. Click "Pay 100.00 EUR"
5. **Expected:** Processing spinner → success screen with transaction ID
6. Refresh the page
7. **Expected:** Saved card appears in stored cards section

### 2. Validation errors on invalid card
1. Leave all fields empty, click Pay
2. **Expected:** Validation errors for all fields
3. Enter card `1234 5678 9012 3456` (fails Luhn)
4. **Expected:** "Invalid card number" error
5. Enter expired date `01/20`
6. **Expected:** "Card expired" error

### 3. Payment with stored card
1. Click the Visa card tile
2. Click "Pay 100.00 EUR"
3. **Expected:** Payment processes directly (no iframe validation). Success screen.
4. Click "Use a new card instead" to return to the card form

### 4. Card decline
1. Enter card `4000 0000 0000 0002` with valid name, expiry, CVV
2. Click Pay
3. **Expected:** Payment declined error screen

## Tech Stack

- **Vite** — build tool + dev server
- **React 19** + TypeScript — main page
- **Tailwind CSS v4** — utility-first styling with design tokens via `@theme`
- **Vanilla HTML/JS** — card iframe (PCI isolation boundary — cannot use Tailwind)
- **Vitest** — unit tests (35 tests covering validation, API, and storage)
- **localStorage** — mock card storage (stands in for server-side card vault)

## Project Structure

```
src/
├── components/      # React UI components
│   ├── PaymentPage  # Main orchestrator — stored cards, iframe, pay flow
│   ├── CardIframe   # iframe wrapper + postMessage handler + style injection
│   ├── StoredCards   # Horizontal card tile row with select/delete
│   ├── PayButton    # Lime pill button with processing spinner
│   ├── SaveCardToggle # Accessible switch component
│   └── PaymentResult  # Success/failure result screens
├── hooks/
│   ├── usePostMessage # iframe communication with origin validation
│   └── useStoredCards # localStorage-backed card CRUD
├── services/
│   ├── mockApi        # processPayment + constants (tokenization is in iframe)
│   └── storedCardsStorage # localStorage read/write with validation
├── styles/
│   └── index.css      # Tailwind @theme config with design tokens
├── test/              # Vitest unit tests
└── types/
    └── payment.ts     # TypeScript types for the payment flow
public/
└── card-iframe.html   # PCI-isolated vanilla HTML/JS card form
```
