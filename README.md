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

### 1. Successful new card payment (covers: new card flow, save card, tokenization)
1. Open `http://localhost:5173`
2. Verify two stored cards (Visa, Mastercard) are displayed at the top
3. Do **not** select a stored card — leave the card form visible
4. In the card form, enter:
   - Cardholder name: `John Doe`
   - Card number: `4111 1111 1111 1111` (card number auto-formats with spaces as you type)
   - Expiry: `12/28`
   - CVV: `123`
5. Toggle "Save card for future payments" **ON** (lime green)
6. Click **"Pay 100.00 EUR"**
7. **Expected:** Button shows "Processing..." with a spinner. After 1-2 seconds, a success screen appears with a green checkmark, "Payment successful", a transaction ID, and the amount.
8. Click **"Make another payment"** to return to the payment form
9. **Expected:** A third card tile now appears in the stored cards section (the card you just saved)

### 2. Validation errors (covers: iframe validation, error display, Luhn check)
1. Without entering any card details, click **"Pay 100.00 EUR"**
2. **Expected:** Validation error messages appear below each field inside the iframe: "Cardholder name is required", "Card number is required", "Expiry date is required", "CVV is required"
3. Enter card number `1234 5678 9012 3456` (this fails the Luhn checksum)
4. Fill in name: `Jane Doe`, expiry: `12/28`, CVV: `123`
5. Click **"Pay 100.00 EUR"**
6. **Expected:** "Invalid card number" error appears below the card number field
7. Fix the card number to `4111 1111 1111 1111`, change expiry to `01/20` (expired)
8. Click **"Pay 100.00 EUR"**
9. **Expected:** "Card expired" error appears below the expiry field

### 3. Payment with stored card (covers: stored card selection, iframe bypass)
1. Click the **Visa** card tile — it highlights with a lime border
2. **Expected:** The card form (iframe) disappears and a "Use a new card instead" button appears
3. Click **"Pay 100.00 EUR"**
4. **Expected:** Payment processes directly without iframe validation. Success screen appears.
5. Click **"Make another payment"**
6. Click the **Visa** card tile again, then click **"Use a new card instead"**
7. **Expected:** The card form (iframe) reappears with empty fields

### 4. Card decline (covers: failed payment, decline handling)
1. In the card form, enter:
   - Cardholder name: `Jane Doe`
   - Card number: `4000 0000 0000 0002` (test decline card — passes validation but payment is declined)
   - Expiry: `12/28`
   - CVV: `456`
2. Click **"Pay 100.00 EUR"**
3. **Expected:** Processing spinner, then a failure screen with a red X icon, "Payment declined", and a decline reason. A "Try again" button is shown.

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
