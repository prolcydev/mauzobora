# Mauzobora React application

This branch replaces the iframe compatibility shell with a native React 19 + Vite application. The app served at `/app` now renders React components directly; it no longer loads the legacy workspace in an iframe.

## Implemented in React
- Firebase email/password authentication, Google sign-in, account creation and password reset.
- Authenticated subscription lookup through the existing `/api/subscribe` endpoint.
- Basic, Premium and Ultra plan display and mobile-money payment initiation/status polling.
- Dashboard metrics, seven-day sales chart and low-stock alerts.
- Point of Sale cart, quantity controls, discount, VAT, customer selection, cash/change checks and receipt printing.
- Product CRUD, restocking, customer CRUD, customer balance collection, sales history/refunds and expense recording.
- Reports, product ranking, payment-method summaries, CSV exports and shop settings.
- Responsive desktop/mobile navigation and compact mobile table cards.
- Existing landing page, Terms, Privacy and serverless subscription API remain in place.

## Data and compatibility
- React uses the existing Firebase project and the existing `users/{uid}` Firestore data layout.
- Existing collection records are retained; the data layer reads the current meta/collection format and the older main/sales document format.
- Writes are gated on an active paid subscription.
- `react/public/legacy-app.html` is retained as a recovery reference during rollout, but is not used by the React application.
- The marketing landing page and legal pages are still static HTML. The authenticated shop workspace is the React app.

## Build and deployment
- Run `npm install` then `npm run build`.
- Vite outputs to the repository-root `dist` directory.
- Vercel routes `/app` to the React entry while keeping `/`, `/terms`, `/privacy`, and `/api/subscribe` available.
- GitHub Actions checks the production build and required output files.

## Release safety
The migration is kept on `react-migration`; production `main` is unchanged. The CI build passing confirms that the project compiles and emits its expected files. It does not replace a live Vercel preview, Firebase rules verification, or end-to-end tests of real sign-in, mobile-money payment, Firestore writes and receipts. Do not merge to production until those checks pass.
