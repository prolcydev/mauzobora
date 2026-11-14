# Mauzobora React migration

This branch adds a Vite + React application entry and a safe compatibility bridge to the existing production workspace.

- React/Vite builds the new application entry.
- The existing workspace is preserved byte-for-byte as `react/public/legacy-app.html` so authentication, Firestore data handling, subscriptions, sales, inventory, reports, and existing actions continue to work during the staged conversion.
- The existing marketing site and legal pages are retained as static pages.
- The production `main` branch is not changed by this migration branch.

Important: this is the compatibility stage, not a completed native React rewrite of every business screen. Replacing the legacy workspace with native React components requires porting and validating each existing workflow before removing the compatibility page.