# Gold Price Dashboard Design

## Goal
Build a sleek, professional, mobile-first static web app that displays Brankas LM gold prices from `https://logam-mulia-api.iamutaki.workers.dev/api/prices/brankaslm` and deploys at the root of `https://antambrankas.github.io/`.

## Architecture
- Vanilla JavaScript with Vite.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Static hosting on GitHub Pages.
- `src/data.js` owns API retrieval and payload validation/normalization.
- `src/formatters.js` owns locale/date/price formatting.
- `src/main.js` owns UI state and DOM rendering.
- No backend unless the third-party endpoint later stops allowing browser CORS.

## UX
- Mobile-first single-column layout, expanding to two price cards on wider screens.
- Strong price hierarchy, warm neutral/gold visual language, restrained shadows and borders.
- Loading skeletons, empty state, error state with retry, refresh button, cached/live indicator, source link, and last-updated timestamp in WIB.
- `buybackPrice: null` renders as `Belum tersedia`.
- API rows are data-driven; no hardcoding of the two current product types.

## Deployment
Repository name is `antambrankas.github.io`, so Vite uses root base `/`.
A GitHub Actions workflow builds with Node, uploads `dist/`, and deploys to GitHub Pages on pushes to `main`.
