# Mauzobora mobile-money subscriptions

Mauzobora now includes a server-side subscription endpoint modelled on the payment flow used in MIKEKA BOOM. MIKEKA BOOM itself has not been modified.

## Subscription prices

| Plan | Price | Term |
|---|---:|---|
| Basic | TSh 40,000 | 1 month |
| Premium | TSh 60,000 | 1 month |
| Ultra | TSh 600,000 | 12 months |

The server owns the prices. It does not accept an amount supplied by the browser.

## Important: deploy on Vercel

GitHub Pages only serves static files; it cannot execute the `/api/subscribe` server function. Deploy this repository as a Vercel project so that the root `index.html` and `api/subscribe.js` are served from the same domain. The existing GitHub Pages workflow is not a payment backend.

1. Import `prolcydev/mauzobora` into Vercel.
2. Keep the project root as the repository root. Vercel will serve `index.html` and expose `api/subscribe.js`.
3. Add the environment variables below in Vercel Project Settings → Environment Variables.
4. Redeploy after adding or changing environment variables.
5. Test with a small approved test transaction before accepting customer payments.

## Required environment variables

- `FIREBASE_SERVICE_ACCOUNT`: the complete Firebase Admin service-account JSON for Firebase project `mauzobora-a1684`, stored as one JSON value in Vercel. Create/download it from Firebase Console → Project settings → Service accounts → Generate new private key. Never put this private key in frontend JavaScript or commit it to GitHub.
- `SPLASHPAY_KEY`: your SplashPay API key.
- `SPLASHPAY_SECRET`: your SplashPay API secret.
- `SPLASHPAY_BASE_URL`: normally `https://api.splashpay.co.tz/api/v1`.

See `.env.example` for the variable names. Do not commit a real `.env` file or service-account JSON.

## Payment lifecycle

1. A customer creates an account and chooses Basic, Premium, or Ultra.
2. Mauzobora asks for the customer's Tanzania mobile-money number.
3. The browser sends a Firebase ID token, plan, period, and phone number to `POST /api/subscribe`.
4. The server verifies the Firebase ID token, validates the plan, normalizes the phone number, and creates a pending order in Firestore.
5. SplashPay initiates the mobile-money prompt.
6. The browser polls the same API for the order status.
7. The server checks the transaction directly with SplashPay and compares the reference, currency, and amount against the saved order.
8. Only a verified successful payment activates or extends `subscriptions/{uid}`.

A browser response alone never activates a subscription.

## Firestore records

- `subscriptionOrders/{reference}`: payment request, owner UID, plan, fixed amount, provider status and verification details.
- `subscriptions/{uid}`: active plan, status, start timestamp and expiry timestamp.

The server uses Firebase Admin SDK, so it performs these writes with server credentials. Do not expose the Admin service-account key in the browser.

## Before going live

- Add the Vercel production domain to Firebase Authentication → Settings → Authorized domains.
- Confirm SplashPay has enabled your merchant account and the mobile-money channels you intend to accept.
- Set the correct production credentials in Vercel.
- Test successful, cancelled, failed, delayed and duplicate payment attempts.
- Review Firestore rules so customers cannot write their own subscription or subscription-order documents.
- Keep the service-account JSON and SplashPay secret private.

The app code is prepared, but real payments will not work until the Vercel deployment and provider/Firebase environment variables are configured.
