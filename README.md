# Actizens Social Impact Foundation — Next.js

Includes all 10 website pages, four publication articles, downloadable starter guides, light/dark themes, mobile layouts and existing animations.

## Run locally

Install Node.js 20.9 or newer (Node.js 24 LTS recommended). Extract this folder, open a terminal inside it, then run:

```sh
npm install
npm run dev
```

Open http://localhost:3000 in your browser. Leave the terminal running. Stop it with Ctrl+C.

## Production

```sh
npm run build
npm start
```

## Editing

- `pages/[[...slug]].jsx`: Next.js Pages Router, statically generated routes and page metadata.
- `pages/_document.jsx`: shared document, styles and theme initialization.
- `src/pages/`: original Figma desktop React layouts.
- `src/mobile.mjs`: mobile page layouts.
- `src/experience.mjs`: enhanced sections, programme guides and shared footer.
- `src/library-pages.mjs` and `src/library-data.mjs`: downloads, publications and article content.
- `public/`: images, fonts, CSS and browser interaction modules.
- `scripts/prepare-next.mjs`: generates page content and assets before development and production builds.

Navigation deliberately uses regular links and full page loads so the existing page-specific interaction modules initialize reliably. Next.js pre-renders every route, then initializes the browser interactions after hydration. This package preserves the supplied layouts; it does not redesign them.

Run `npm test` after a build to check routes, assets, guides and interaction logic. Generated `.next`, `.generated`, `.cache` and `dist` folders are recreated automatically.

## Pages

Home, About, Programs, Events, Gallery, Contact, Donate, Resources, Downloads, Publications and four individual explainer pages under `/publications/`.

## Service connections

Contact, newsletter and document requests prepare email drafts. Donations are processed through Paystack or Flutterwave hosted checkout (`lib/payments.mjs`, `pages/api/donations/`). Copy `.env.example` to `.env.local` and add the provider keys; set `SITE_URL` to the public site address in production. Swap the test keys for live keys before accepting real money. Resource guides and explainers are website starter content, not official organisational reports. Saved toolkits, reading lists and theme preferences are stored in the visitor's browser.

Framework reference: https://nextjs.org/docs/pages
