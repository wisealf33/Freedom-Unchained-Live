# Founders' Circle Launch Notes

## Freedom Unchained placement

This project now lives inside the Freedom Unchained site at:

- `projects/founders-circle/index.html`

The existing Freedom Unchained project link at `projects/founders-circle.html` redirects into this folder.

If this folder is published on a static host, the pages will load and the forms can still work in the visitor's browser, but applications, bookings, admin availability, and date overrides will not be shared across people or saved server-side. For the alignment-call calendar to work properly online, deploy this folder as the Node app described below.

## Local production-style run

```bash
npm install
ADMIN_PASSWORD="choose-a-private-password" npm start
```

Then open:

- Public site: `http://localhost:4173`
- Apply page: `http://localhost:4173/apply.html`
- Applicant dashboard: `http://localhost:4173/admin-applications.html`
- Admin availability: `http://localhost:4173/admin-availability.html`

## Required production settings

Set these environment variables on the host:

- `ADMIN_PASSWORD`: protects the admin availability page and availability-editing API routes.
- `SESSION_SECRET`: long random secret used to sign login sessions.
- `INITIAL_ADMIN_EMAIL`: the email for the first account. This first account receives both `admin` and `member` roles.
- `INITIAL_ADMIN_PASSWORD`: temporary password for the first account. The backend stores only a salted hash in the private data store.
- `DATA_DIR`: optional path for saved data. Use a persistent disk/path on the host.
- `APP_BASE_URL`: the public Founders Circle backend URL used inside password reset emails, such as `https://founderscircle.freedomunchained.life`.
- `RESEND_API_KEY`: optional Resend API key used for password reset emails.
- `RESEND_EMAIL_FROM`: the verified sender for password reset emails, such as `Founders Circle <members@founderscircle.freedomunchained.life>`.
- `RESEND_EMAIL_REPLY_TO`: optional reply-to address for password reset emails.
- `SENDFOX_TOKEN`: optional SendFox personal access token. When set, new applications are added to SendFox.
- `SENDFOX_APPLIED_LIST_ID`: optional SendFox list ID for people who complete the first application step. You can also use `SENDFOX_LIST_ID` if you only want one list for now.
- `SENDFOX_DETAILS_LIST_ID`, `SENDFOX_CALL_BOOKED_LIST_ID`, `SENDFOX_APPROVED_LIST_ID`, `SENDFOX_PMA_SENT_LIST_ID`, `SENDFOX_PAYMENT_LIST_ID`, `SENDFOX_MEMBER_LIST_ID`, `SENDFOX_DECLINED_LIST_ID`: optional stage-specific lists for SendFox automations.
- `MEMBERSHIP_FEE_USD`: optional yearly fee override. Defaults to `33`.
- Crypto receiving addresses: optional receiving addresses for the crypto payment page. Leave a currency unset until the real receiving address is ready.

  `CRYPTO_ADDRESS_BTC`, `CRYPTO_ADDRESS_LTC`, `CRYPTO_ADDRESS_DASH`, `CRYPTO_ADDRESS_XRP`, `CRYPTO_ADDRESS_XMR`, `CRYPTO_ADDRESS_ZEC`, `CRYPTO_ADDRESS_BCH`, `CRYPTO_ADDRESS_DOGE`, `CRYPTO_ADDRESS_ETH`, `CRYPTO_ADDRESS_LINK`, `CRYPTO_ADDRESS_ADA`, `CRYPTO_ADDRESS_USDT`, `CRYPTO_ADDRESS_USDC`, `CRYPTO_ADDRESS_BNB`, `CRYPTO_ADDRESS_TRX`, `CRYPTO_ADDRESS_HYPE`, `CRYPTO_ADDRESS_ICP`

The app stores applications, bookings, availability, accounts, sessions, and date overrides in `data/store.json` by default. Do not commit this file. Use a persistent private disk on the host.

The backend also exposes `GET /healthz` for host health checks. Public calendar pages use `/founders-public-state`, which only returns availability and booked slot times. Full applicant, payment, and admin state is available through `/founders-state` only behind an admin login or the legacy admin password.

## First admin/member account

Set `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` on the backend host before first startup. On startup, the backend creates that account with both roles:

- `admin`: can open admin dashboards and manage applicants.
- `member`: can open the private member portal.

After the account exists, the password hash is stored in the private data file. Treat the first password as temporary and rotate it after the real account-management screen exists.

Member login and password reset require the Node backend. Static hosting can show the pages, but it cannot verify passwords, create sessions, or send reset links. The forgot-password flow creates a one-hour reset token in the private data store. When `RESEND_API_KEY` and `RESEND_EMAIL_FROM` are set, the backend sends the reset link through Resend.

## Resend password reset setup

Use Resend for transactional emails like password reset links. SendFox still handles funnel/list automations; Resend handles direct system emails.

1. Verify the sending domain in Resend.
2. Create a Resend API key.
3. Set `RESEND_API_KEY` on the backend host.
4. Set `RESEND_EMAIL_FROM` to an address on the verified domain, for example `Founders Circle <members@founderscircle.freedomunchained.life>`.
5. Set `APP_BASE_URL` to the public backend URL where the reset page actually loads.
6. Restart/redeploy the backend after adding these values.

The reset endpoint always returns a generic message to visitors. In production it does not expose the reset link in the browser response; the link is only sent through email.

## SendFox funnel setup

Recommended starting funnel:

1. Create a SendFox list named `Founders Circle - Applied`.
2. Create lists for each major stage you want to automate: `Details Completed`, `Call Booked`, `Approved`, `PMA Sent`, `Payment`, `Member`, and `Declined`.
3. Create a personal access token in SendFox under account OAuth/API settings.
4. Set `SENDFOX_TOKEN` to that token on the production host.
5. Set each `SENDFOX_*_LIST_ID` value to the numeric ID of the matching SendFox list.

When someone submits first name, last name, and email on `apply.html`, the app saves the application and adds that contact to the SendFox applied list. When they schedule, answer the questionnaire, or when you update their stage in the admin dashboard, the backend can move them into the matching SendFox list. SendFox can then run the emails for each stage.

## Deployment package

This folder now includes:

- `.env.example`: copy of the production variables you need to fill in.
- `Dockerfile`: container startup for VPS, Fly.io, Railway, or any Docker-capable host.
- `render.yaml`: Render Blueprint with a persistent `/var/data` disk and `/healthz` health check.

For Render, connect the repo, point the service at `projects/founders-circle/render.yaml`, fill in the secret environment variables, then point Cloudflare `founders.freedomunchained.life` at the service URL.

## Reusable payment processor links

The payment pages can now be reused by any Freedom Unchained project. A project can start a payment by linking to `payment.html` with a few values in the URL:

```text
payment.html?project=foundation-freedom&purpose=Contribution&amount=33
```

Useful values:

- `project`: where the payment belongs, such as `founders-circle`, `foundation-freedom`, or `freedom-unchained`.
- `purpose`: what the payment is for, such as `Yearly membership`, `Donation`, `Course`, or `Product`.
- `amount`: the USD amount to quote before crypto conversion.
- `reference`: optional internal project record, product id, applicant id, order id, or donation id.
- `name` and `email`: optional payer details if the project already collected them.
- `destination`: optional internal label for where the finished payment should be routed.

The app creates a payment session, lets the payer choose Crypto or Bridge Bucks, stores the submitted transaction/reference details, and shows the session in `admin-payments.html`.

Crypto payments currently verify at the tracking level: the session records the transaction hash, selected currency, receiving address, required confirmations, and `pending-confirmations` status. The intended final flow is automatic blockchain confirmation: once the transaction is found on-chain and reaches the required confirmations, the payment becomes confirmed without admin approval. Full automatic confirmation needs either your own node connections or trusted blockchain explorer APIs for each supported chain.

Current applicant path:

1. Apply with name and email.
2. Schedule an alignment call.
3. Answer the pre-call questions.
4. Land on the confirmation page.
5. After manual approval, complete the PMA agreement.
6. Choose crypto or Bridge Bucks on the payment page.
7. Bridge Bucks users follow the Freedom_Unchained Bridge Bucks link and submit a reference.
8. Crypto users choose a currency, lock a one-hour quote for the yearly membership fee, send to the matching receiving address, and submit the transaction hash.
9. Admin confirms payment and marks the applicant as a member.

Later stages can use separate SendFox lists or automations:

- `Founders Circle - Details Completed`
- `Founders Circle - Alignment Call Booked`
- `Founders Circle - Approved`
- `Founders Circle - PMA Sent`
- `Founders Circle - Member`

## Suggested first launch host

Use a Node host that supports persistent storage, such as Render, Railway, Fly.io, or a small VPS. Static-only hosts are not enough because availability and bookings must be shared and saved server-side.
