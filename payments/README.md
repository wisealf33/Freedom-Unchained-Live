# Freedom Payments

A standalone payment system for Freedom Unchained projects, trusts, PMAs, products, donations, courses, and memberships.

## What this separates

- **Accounts**: a project, trust, PMA, product line, or organization that receives payments.
- **Addresses**: each account can have its own crypto receiving address per asset.
- **Bridge Bucks**: each account can have its own Bridge Bucks link.
- **Sessions**: each checkout has an amount, purpose, payer details, reference id, and destination account.
- **Confirmation**: crypto sessions are designed to move from submitted transaction hash to pending confirmations to confirmed.

## Hybrid Architecture

The payment system is designed to run in two pieces:

1. **Hosted gateway**: runs online at a domain like `payments.freedomunchained.life`. It serves public checkout pages, locks crypto quotes, accepts transaction hashes, and later runs blockchain confirmation checks.
2. **Local dashboard**: runs on your computer at a local address like `http://localhost:5191`. It manages accounts, projects, trusts, PMAs, Bridge Bucks links, crypto addresses, sessions, and private records.

The hosted gateway does not expose the management dashboard. The local dashboard talks to the hosted gateway through a private server-side API key.

## Run as the local dashboard

```bash
npm install
npm start
```

Open:

- Admin/payment system: `http://localhost:5191`
- Checkout pages are created from the admin screen.

## Run as the hosted public gateway

```bash
PAYMENTS_ROLE=gateway \
PAYMENTS_ADMIN_API_KEY="choose-a-long-private-key" \
npm start
```

In gateway mode:

- `/checkout.html` remains public.
- `/api/assets`, `/api/sessions/:id`, `/api/quote`, and payment submission stay public for checkout use.
- `/` does not serve the dashboard.
- `/api/state`, `/api/accounts`, and new checkout creation require `PAYMENTS_ADMIN_API_KEY`.

## Run local dashboard connected to hosted gateway

```bash
PAYMENTS_GATEWAY_URL="https://payments.freedomunchained.life" \
PAYMENTS_GATEWAY_API_KEY="same-private-key-as-hosted-gateway" \
npm start
```

In this mode, your browser only talks to the local dashboard. The local dashboard server syncs with the hosted gateway using the private API key. The API key is never placed in the browser.

## Next production layer

The current version records crypto transaction hashes and required confirmations. The next layer is automatic verification, using your own nodes or chain-specific APIs, so a payment is marked confirmed after it reaches the required confirmation count.
