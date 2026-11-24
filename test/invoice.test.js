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

test('invoice uses the HSN GST slab of each line', () => {
  assert.deepEqual(invoice.computeInvoiceFigures(orders[1001]).rows.map((r) => r.gstPercent), [18, 5]);
  assert.deepEqual(invoice.computeInvoiceFigures(orders[1007]).rows.map((r) => r.gstPercent), [12, 5]);
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1001])), { subtotal: 610, discount: 0, tax: 66.9, total: 676.9 });
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1007])), { subtotal: 1280, discount: 0, tax: 127, total: 1407 });
});

test('invoice applies the coupon (with its cap) before tax', () => {
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1002])), { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 });
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1004])), { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 });
});

test('invoice matches checkout for every sample order, CGST + SGST = GST', () => {
  Object.keys(orders).forEach((id) => {
    const o = orders[id];
    const inv = invoice.computeInvoiceFigures(o);
    assert.deepEqual(pick(inv), pick(pricing.computeTotals(o.items, o.coupon)), 'order #' + id);
    assert.equal(Math.round((inv.cgst + inv.sgst) * 100) / 100, inv.tax, 'order #' + id);
  });
});

test('rendered invoice shows the checkout total and no reconciliation notice', () => {
  const html = invoice.render(Object.assign({ date: '05/01/2022', total: 963.9 }, orders[1002]));
  assert.match(html, /Invoice Total<\/td><td class="r">₹963\.90/);
  assert.doesNotMatch(html, /Reconciliation Notice/);
});

test('all-18% order with no coupon already matches checkout', () => {
  assert.deepEqual(pick(invoice.computeInvoiceFigures(orders[1008])), pick(pricing.computeTotals(orders[1008].items, '')));
});
