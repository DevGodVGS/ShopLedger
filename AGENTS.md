# AGENTS.md — ShopLedger

Wholesale/retail POS, Khata (customer credit) ledger and GST invoicing for one kirana shop.
Node + Express 4, plain CommonJS, no build step. The database is one JSON file: `data/db.json`.

## Commands
- Install: `npm install --no-package-lock` (there is no lock file; do not add one)
- Run: `npm start` → http://localhost:3000 (`PORT` overrides)
- Test: `node --test` (Node's built-in runner; tests live in `test/*.test.js`)

## Module map
- `server.js` — Express app, mounts `routes/*` under `/api`, serves `public/`, and `/orders/:id/invoice`
- `routes/products.js` — product list, coupons
- `routes/orders.js` — list / create / cancel orders (builds line items: `id, sku, name, hsn, price, qty`)
- `routes/customers.js` — Khata customers and settlements
- `routes/reports.js` — dashboard, GST reconciliation, POS price preview, admin export
- `lib/pricing.js` — checkout totals: coupon discount (with cap) first, then per-line HSN GST slab
- `lib/tax.js` — GST rate per item (`gstRate` or HSN slab in `config.js`), CGST/SGST split
- `lib/coupons.js` — coupon validation and discount
- `lib/invoice.js` — printable invoice figures and HTML
- `lib/inventory.js` — stock check, deduct on order, return on cancel (`sellable = stock - reserved`)
- `lib/orders.js` — add / get / cancel / list (filters + newest-first sort)
- `lib/dates.js` — orders store dates as `DD/MM/YYYY` strings; date picker sends `YYYY-MM-DD`
- `lib/ledger.js` — Khata balances: `openingBalance + totalBilled - totalSettled`
- `lib/store.js` — reads/writes `data/db.json` (never use it in tests)
- `config.js` — shop details, GST slabs, coupons
- `public/` — single-page UI (`index.html`, `js/app.js`, `css/style.css`)

## Rules
1. Read before you touch: understand the module and its callers first.
2. Pin today's behaviour with characterization tests before changing code.
3. Change only the module(s) the ticket is about.
4. Make the smallest fix that works.
5. Tests use in-memory data only and never read or write `data/db.json` or call `lib/store.js`.

Review the diff before opening a pull request.

## Tickets and allowed files
- Invoice/GST mismatch → `lib/invoice.js` (`lib/tax.js` only if truly needed)
- Order sort/date filter + Khata settlements → `lib/orders.js` (list only), `lib/dates.js`, `lib/ledger.js`, `routes/customers.js`
- Last unit unsellable + cancel not restoring stock → `lib/inventory.js`, `lib/orders.js` (cancel only)
