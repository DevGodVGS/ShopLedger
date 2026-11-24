# ShopLedger instructions

## Stack
- Node.js CommonJS app using Express 4 and `body-parser`; browser UI is plain HTML, CSS, and JavaScript.
- Persistence is a local JSON file (`data/db.json`) through `lib/store.js`.

## Module map
- `server.js` — builds the Express app, serves `public/`, mounts API routes, and serves printable invoice HTML.
- `config.js` — port, shop details, GST slabs/default, inventory settings, and coupon definitions.
- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order list/detail/create/cancel endpoints and stock, pricing, coupon, and Khata orchestration.
- `routes/products.js` — product catalog and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, lookup, validation, discount calculation, and listing.
- `lib/dates.js` — Indian date formatting, date-key normalization, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, sellable stock, stock checks/mutations, and inventory summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer lookup/listing, Khata charges/reversals, and settlement recording.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — order subtotal, coupon discount, and billed total calculation.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — reads, normalizes, writes, and audit-logs the JSON database.
- `lib/tax.js` — GST rate resolution by HSN and CGST/SGST split calculation.
- `public/css/style.css` — application layout and visual styles.
- `public/index.html` — single-page ShopLedger interface and invoice/order views.
- `public/js/app.js` — browser-side API calls, POS/cart, and dashboard/order UI behavior.
- `data/db.json` — current JSON database containing products, customers, orders, settlements, and audit data.

## Commands
- Install dependencies: `npm install --no-package-lock`
- Start the app: `npm start`
- Run tests: `node --test`

## Standing rules
1. Read before you touch.
2. Pin today's behaviour with characterization tests before changing code.
3. Change only the module(s) the ticket is about.
4. Make the smallest fix that works.
5. Tests use in-memory data only and never read or write `data/db.json` or call `lib/store.js`.

## Current ticket
- “Invoice total and GST breakdown do not match what the customer was billed.”
- Allowed changes: `lib/invoice.js`; `lib/tax.js` only if truly needed.
- Read-only context: `lib/pricing.js`, `routes/orders.js`, and `config.js`.
- Change no other files for this ticket.
