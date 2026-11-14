# Mauzobora React application

The authenticated shop workspace is a native React 19 + Vite application served at `/app`. The marketing landing page and legal pages remain static HTML.

## Implemented in React
- Firebase email/password authentication, Google sign-in, account creation and password reset.
- Authenticated subscription lookup through the existing `/api/subscribe` endpoint.
- Basic, Premium and Ultra plan display and mobile-money payment initiation/status polling.
- Dashboard metrics, seven-day sales chart and low-stock alerts.
- Point of Sale cart, quantity controls, discount, VAT, customer selection, cash/change checks and receipt printing.
- Product CRUD, restocking, customer CRUD, customer balance collection, sales history/refunds and expense recording.
- Reports, product ranking, payment-method summaries, CSV exports and shop settings.
- Responsive desktop/mobile navigation and compact mobile table cards.
- Native shop assistant for sales/profit questions, stock alerts, customer balances, inventory value and quick navigation.

## Data and compatibility
- React uses the existing Firebase project and the existing `users/{uid}` Firestore data layout.
- Existing collection records are retained; the data layer reads the current meta/collection format and the older main/sales document format.
- Writes are gated on an active paid subscription.
- `react/public/legacy-app.html` is retained as a recovery reference and is not used by the React application.

## Build and deployment
- Run `npm install` then `npm run build`.
- Vite outputs to the repository-root `dist` directory with the React entry as `app.html`.
- Vercel serves the static marketing page at `/`, the React workspace at `/app`, and the legal pages at `/terms` and `/privacy`.
- The existing `/api/subscribe` serverless endpoint remains available.
- GitHub Actions verifies that the app, landing page and legal pages are emitted.

## Release checks
A passing build verifies compilation and required output files. It does not replace live checks of sign-in, mobile-money payment, Firestore writes and receipts.