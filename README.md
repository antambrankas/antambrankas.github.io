# Harga Emas Brankas LM

Mobile-first gold price dashboard built with vanilla JavaScript, Vite, and Tailwind CSS v4.

## Data source

The app reads the third-party endpoint:

`https://logam-mulia-api.iamutaki.workers.dev/api/prices/brankaslm`

The interface is not an official ANTAM or Brankas LM website and is not affiliated with the data provider.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## GitHub Pages deployment

This project is configured for the repository `antambrankas.github.io`, so it deploys at the root URL when the GitHub user/organization is also named `antambrankas`:

`https://antambrankas.github.io/`

One-time setup on GitHub:

1. Push this project to the `antambrankas.github.io` repository on the `main` branch.
2. Open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open the **Actions** tab and confirm the `Deploy to GitHub Pages` workflow succeeds.

After that, each push to `main` automatically runs tests, builds the Vite app, and deploys the `dist/` directory.

## Project structure

```text
.
├── .github/workflows/deploy.yml
├── index.html
├── src/
│   ├── data.js
│   ├── formatters.js
│   ├── main.js
│   └── style.css
├── tests/
│   ├── data.test.js
│   └── formatters.test.js
├── package.json
└── vite.config.js
```
