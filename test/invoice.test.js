// Ticket: invoice total and GST breakdown do not match what the customer was billed.
// Compares invoice.computeInvoiceFigures with pricing.computeTotals on the same items and coupon.
const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');
const { products: P, line } = require('./helpers');

const orders = {
  1001: { id: 1001, coupon: '', items: [line(P.tea, 2), line(P.dal, 2)] },
  1002: { id: 1002, coupon: 'SAVE10', items: [line(P.rice, 1), line(P.sunOil, 2)] },
  1004: { id: 1004, coupon: 'SAVE10', items: [line(P.gnOil, 2)] },
  1007: { id: 1007, coupon: '', items: [line(P.ghee, 2), line(P.sunOil, 2)] },
  1008: { id: 1008, coupon: '', items: [line(P.tea, 1), line(P.kokum, 2)] }
};

function pick(f) {
  return { subtotal: f.subtotal, discount: f.discount, tax: f.tax, total: f.total };
}

test('checkout totals (pricing.computeTotals) for the sample orders', () => {
  assert.deepEqual(pick(pricing.computeTotals(orders[1001].items, '')), { subtotal: 610, discount: 0, tax: 66.9, total: 676.9 });
  assert.deepEqual(pick(pricing.computeTotals(orders[1002].items, 'SAVE10')), { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 });
  assert.deepEqual(pick(pricing.computeTotals(orders[1004].items, 'SAVE10')), { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 });
  assert.deepEqual(pick(pricing.computeTotals(orders[1007].items, '')), { subtotal: 1280, discount: 0, tax: 127, total: 1407 });
  assert.deepEqual(pick(pricing.computeTotals(orders[1008].items, '')), { subtotal: 500, discount: 0, tax: 90, total: 590 });
});

test('CURRENT BEHAVIOUR: invoice taxes every line at 18% and ignores the HSN slab', () => {
  assert.deepEqual(invoice.computeInvoiceFigures(orders[1001]).rows.map((r) => r.gstPercent), [18, 18]);
  assert.deepEqual(invoice.computeInvoiceFigures(orders[1007]).rows.map((r) => r.gstPercent), [18, 18]);
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1001])), { subtotal: 610, discount: 0, tax: 109.8, total: 719.8 });
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1007])), { subtotal: 1280, discount: 0, tax: 230.4, total: 1510.4 });
});

test('CURRENT BEHAVIOUR: invoice applies the coupon after tax and ignores the cap', () => {
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1002])), { subtotal: 1020, discount: 120.36, tax: 183.6, total: 1083.24 });
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1004])), { subtotal: 2240, discount: 264.32, tax: 403.2, total: 2378.88 });
});

test('all-18% order with no coupon already matches checkout', () => {
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1008])), pick(pricing.computeTotals(orders[1008].items, '')));
});
