# Card Payment Page — Technical Assessment

A mocked card payment page demonstrating **PCI-compliant iframe isolation**. The main page (React + TypeScript) communicates with an embedded vanilla HTML iframe via `postMessage` — sensitive card data never touches the main page's DOM or JavaScript scope.

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
│  │  - Card number, expiry, CVV       │  │
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

## postMessage Protocol

| Event | Direction | Purpose |
|-------|-----------|---------|
| `CARD_IFRAME_READY` | iframe → main | iframe loaded, ready for styling |
| `INJECT_STYLES` | main → iframe | Send CSS to match merchant branding |
| `STYLES_APPLIED` | iframe → main | Confirm styles applied |
| `TOKENIZE_CARD` | main → iframe | Trigger validation + tokenization |
| `VALIDATION_ERROR` | iframe → main | Field-level validation failures |
| `CARD_TOKENIZED` | iframe → main | Token + masked PAN (never raw card data) |

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

### 4. Card decline
1. Enter card `4000 0000 0000 0002` with valid name, expiry, CVV
2. Click Pay
3. **Expected:** Payment declined error screen

## Tech Stack

- **Vite** — build tool + dev server
- **React 19** + TypeScript — main page
- **Vanilla HTML/JS** — card iframe (PCI isolation)
- **CSS Variables** — design system tokens
- **localStorage** — mock card storage

## Project Structure

```
src/
├── components/      # React components
├── hooks/           # usePostMessage, useStoredCards
├── services/        # Mock API, localStorage helpers
├── styles/          # Global CSS + design tokens
└── types/           # TypeScript type definitions
public/
└── card-iframe.html # PCI-isolated card form
```
