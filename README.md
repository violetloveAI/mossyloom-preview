# Mossyloom · The Little Stroll

A knitwear collection preview in sky blue, cream and plum. The fourth design is now the only storefront, with 18 scarves, seven hats, five glove styles and 130 real supplier photographs.

**[Open the collection preview](https://violetloveai.github.io/mossyloom-preview/)**

![Mossyloom collection preview](assets/preview.png)

## What works

- Browse 30 product styles, search by name, pattern or visual color, filter by category, and sort by name.
- View each product’s photo gallery and enlarge individual images.
- Save up to 30 styles and multiple color preferences per style in your browser. Copy or download the list, or return to it later in the same browser.
- Explore outfit ideas, read the new bilingual brand story, and switch between English and Chinese.
- Read the current launch status, delivery information and privacy notice.

Saved pieces are not orders, stock reservations or messages to the shop. The preview has no customer accounts, checkout, payment processing, email subscriptions or customer database. It does not collect passwords, delivery addresses or card information. Earlier demo prices, reviews, stock, coupons and payment simulations have been removed.

The first collection is still being prepared. The 30 independent listing candidates include eight with previously recorded supplier color options, 11 with multiple product colors visible in photographs, two whose source titles mention 12 colors, and nine whose additional colors are proposals. This does not establish current SKU availability. Source records were collected on October 2, 2026; the live supplier pages could not be rechecked on October 3.

Material composition, measurements, final color options, retail prices, stock and commercial image rights need confirmation before sales can start. Color choices are personal preferences, not selectable inventory. Options distinguish source-page names, photo references, and proposed colors whose supplier availability is unknown. Some proposed colors have no photograph; choosing one leaves the gallery unchanged. See the [image record](ASSET-SOURCES.md).

## Run locally

With Python 3 installed, no additional dependencies or build step are needed.

```sh
git clone https://github.com/violetloveAI/mossyloom-preview.git
cd mossyloom-preview
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`. Use an HTTP server rather than opening `index.html` as a local file, because the app loads its catalog and JavaScript modules over HTTP.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | App entry, metadata and local stylesheets |
| `js/app.js` | Navigation, language, collection filters and editorial pages |
| `js/collection.js` | Product galleries, multiple color preferences and saved lists in browser storage |
| `js/story-copy.js` | The Little Stroll brand story and values in English and Chinese |
| `styles.css`, `collection.css` | Responsive storefront and product layouts |
| `data/catalog.json` | 30 product styles, color-reference status and bilingual descriptions |
| `assets/products/` | Local product photographs and thumbnails |
| `data/image-provenance.json` | Photo sources and hashes |

Relative asset paths and hash routes work below a repository path. Old `?style=1` through `?style=4` links open the chosen design. Removed product and shopping routes explain the change and link back to the collection.

The site uses no external runtime scripts, web fonts, analytics or advertising pixels. Language, saved product IDs and color preferences use local storage when available. The privacy page can clear Mossyloom data, including data left by the previous demo. GitHub may retain its normal hosting logs.

## Hosting and launch boundary

GitHub Pages hosts this design preview. [GitHub’s Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) prohibit using the service as free hosting for an online business or e-commerce site. A commercial launch needs suitable hosting, a real commerce backend, a supported merchant/payment account, approved product information, prices, stock and service policies. Merely hiding checkout is not a substitute for meeting a host’s terms.

Search indexing remains disabled for this review version. The private owner questionnaire, procurement costs and shipping calculations are kept outside this public repository. The previous four-design demo remains recoverable in Git history.

## Verification

Browser checks cover desktop and mobile navigation, English/Chinese switching, search and category filtering, all 30 product pages and photo resources, saved-list persistence and exports, missing pages, and retired shopping routes. Saved styles and their color preferences survive a refresh and export as a bilingual text list. Colors saved before a style is added remain local drafts and are excluded from exports. A saved list never becomes an order.

This repository does not grant an open-source or asset reuse license. Supplier-photo permission has been recorded for the public demonstration; commercial reuse is a separate launch requirement.
