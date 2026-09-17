# Gold Price Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a mobile-first Brankas LM gold-price dashboard ready for `antambrankas.github.io`.

**Architecture:** Vite serves a vanilla JavaScript application. Pure formatting and payload-normalization logic is isolated from DOM code so it can be covered with Node's built-in test runner. GitHub Actions builds and deploys `dist/` to Pages.

**Tech Stack:** JavaScript (ES modules), Vite, Tailwind CSS v4, Node `node:test`, GitHub Pages Actions.

**Spec:** `docs/superpowers/specs/2026-09-17-gold-price-dashboard-design.md`

## Global Constraints
- Mobile-first and responsive.
- Tailwind CSS v4 via `@tailwindcss/vite`.
- Vanilla JavaScript; no React/Vue.
- Fetch data from the provided Brankas LM endpoint.
- Root GitHub Pages deployment for repository `antambrankas.github.io`.
- `null` buyback price must never display as zero.

---

### Task 1: Data and formatting core
**Files:** Create `tests/formatters.test.js`, `tests/data.test.js`, `src/formatters.js`, `src/data.js`.
**Interfaces:** `formatCurrency`, `formatWeight`, `formatRecordedDate`, `formatTimestampWIB`; `normalizePricePayload`, `fetchGoldPrices`.
- [ ] Write failing tests for IDR, weight, dates, valid payload normalization, null buyback, invalid payload, and failed HTTP requests.
- [ ] Run `npm test` and confirm failure because production modules do not exist.
- [ ] Implement the minimum pure functions and API function.
- [ ] Run `npm test` and confirm all tests pass.

### Task 2: Responsive application UI
**Files:** Create `index.html`, `src/style.css`, `src/main.js`.
**Interfaces:** Imports Task 1 functions; renders loading/success/empty/error states and handles refresh.
- [ ] Build semantic app shell and accessible status region.
- [ ] Add Tailwind v4 theme/CSS and responsive card design.
- [ ] Render API rows dynamically and wire retry/refresh.
- [ ] Verify production build with `npm run build`.

### Task 3: GitHub Pages delivery
**Files:** Create `vite.config.js`, `.github/workflows/deploy.yml`, `.gitignore`, `README.md`.
- [ ] Configure Tailwind v4 Vite plugin and root base `/`.
- [ ] Configure Pages workflow to install, test, build, upload `dist/`, and deploy on `main`.
- [ ] Document local development and one-time GitHub Pages settings.
- [ ] Run `npm test` and `npm run build` from a clean project state.
