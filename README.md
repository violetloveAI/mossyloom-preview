# Mossyloom · Four ways to feel at home

A knitwear concept store with four distinct designs and a complete simulated shopping journey.

**[Open the live preview](https://violetloveAI.github.io/mossyloom-preview/)** · **[中文测试指南 PDF](docs/Mossyloom-Test-Guide.pdf)**

![Mossyloom storefront](assets/preview.png)

## Try the store

Choose **01–04** in the top bar. The layout, typography, colors and logo change while the shopping bag, favorites and account state remain available. The site opens in English; use **中文 / EN** to switch language.

| Design | Visual direction |
| --- | --- |
| 01 · The Quiet Edit | Ivory, oatmeal and burgundy; serif typography and a large editorial photograph |
| 02 · Dopamine Club | Klein blue, candy pink and neon green; bold poster type and photo collage |
| 03 · The After Class | Navy and cream with cherry red; a collegiate journal and asymmetric photo columns |
| 04 · The Little Stroll | Sky blue, cream and plum; photo postcards and a small boutique layout |

The first three palettes follow the user's original color specifications. The fourth follows the user's chosen Moody Mumu reference and the previously developed sky-blue palette. The original reference site's photographs and branding are not used.

## Demo account and checkout

- Email: `demo@mossyloom.test`
- Password: `Mossy2026!`
- A one-click demo login is also available.
- Coupon: `MOSSY10` gives 10% off the item subtotal.
- Standard delivery: $6, free when the discounted subtotal reaches $75.
- Express delivery: $12.

These credentials are a public test identity. There is no authentication server. Checkout shows a fixed demonstration card and supports simulated card or PayPal outcomes. It never sends card data, charges money, emails a receipt or triggers fulfillment. Use the fictional address provided in the form.

Browse 36 catalog entries, search and filter, choose a photographed color, save favorites, change bag quantities, apply a coupon, and place a demo order. The payment screen can simulate a decline so you can test retrying. Orders support cancellation before dispatch, simulated dispatch and delivery, and return requests after delivery. Login adds one clearly marked sample order for testing.

The catalog includes 33 individual products and three demonstration pairings, with 87 distinct supplier photographs. Names, USD retail prices, stock, ratings, sizing information and service policies are illustrative. See [image sources and permission](ASSET-SOURCES.md).

## Run locally

Python 3 is sufficient. There is no install or build step.

```sh
git clone https://github.com/violetloveAI/mossyloom-preview.git
cd mossyloom-preview
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`. Serve the files over HTTP; opening `index.html` directly does not support the catalog fetch and JavaScript modules reliably.

## Structure

```text
index.html                 App entry point
styles.css                 Four layouts, shared navigation and responsive styling
commerce.css               Product, account, cart, checkout and order styling
js/app.js                  Hash routes, design switch, language and catalog browsing
js/commerce.js             Local demo shopping state and order workflows
data/catalog.json          Bilingual product descriptions and photo variants
assets/                    Local photographs, logos and preview screenshot
docs/Mossyloom-Test-Guide.pdf  Illustrated Chinese test guide
```

The site uses browser JavaScript modules, CSS and local files. No external runtime scripts, fonts, analytics, API keys or payment libraries are required. Relative asset paths and hash routes support deployment below a GitHub Pages repository path. The `.nojekyll` file enables direct static-file hosting.

Demo state stays in `localStorage` on the current browser. It is not shared between devices. The **Privacy & reset** page can clear this store's demo data. Form values are not sent to a customer backend; GitHub Pages may retain its normal hosting logs. Browser storage is a convenience for this demonstration and is not a secure customer system.

## Verification

The preview was checked in Chrome at desktop and 390px mobile widths, across all four designs. Checks cover real photo loading, theme and language changes, search and filtering, variant selection, demo login, coupons, delivery totals, declined and successful payments, order persistence, cancellation and return requests. The Chinese guide documents the paths intended for reviewers.

This repository is a public preview for viewing and testing. It does not grant an open-source or asset reuse license. Supplier-photo permission was confirmed by the user for this public demonstration; it does not establish unrestricted commercial reuse rights.
