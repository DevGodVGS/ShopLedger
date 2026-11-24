const assert = require('node:assert/strict');
const test = require('node:test');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

test('CURRENT BEHAVIOUR: order #1001 invoice uses default GST instead of HSN slabs', function () {
  const items = [
    { id: 8, sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g', hsn: '0902', price: 140, qty: 2 },
    { id: 2, sku: 'GRN-002', name: 'Unpolished Toor Dal 1kg', hsn: '0713', price: 165, qty: 2 }
  ];
  const order = { id: 1001, items: items, coupon: '' };
  const figures = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(figures, {
    subtotal: 610,
    discount: 0,
    tax: 109.8,
    cgst: 54.9,
    sgst: 54.9,
    total: 719.8,
    rows: [
      { name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', qty: 2, price: 140, gstPercent: 18, line: 280, lineTax: 50.4 },
      { name: 'Unpolished Toor Dal 1kg', sku: 'GRN-002', hsn: '0713', qty: 2, price: 165, gstPercent: 18, line: 330, lineTax: 59.4 }
    ]
  });
  assert.equal(totals.total, 676.9);
  assert.equal(totals.tax, 66.9);
});

test('CURRENT BEHAVIOUR: order #1002 invoice applies SAVE10 to gross with default GST', function () {
  const items = [
    { id: 1, sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg', hsn: '1006', price: 640, qty: 1 },
    { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', hsn: '1512', price: 190, qty: 2 }
  ];
  const order = { id: 1002, items: items, coupon: 'SAVE10' };
  const figures = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(figures, {
    subtotal: 1020,
    discount: 120.36,
    tax: 183.6,
    cgst: 91.8,
    sgst: 91.8,
    total: 1083.24,
    rows: [
      { name: 'Indrayani Basmati Rice 5kg', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 18, line: 640, lineTax: 115.2 },
      { name: 'Cold-Pressed Sunflower Oil 1L', sku: 'OIL-001', hsn: '1512', qty: 2, price: 190, gstPercent: 18, line: 380, lineTax: 68.4 }
    ]
  });
  assert.equal(totals.discount, 102);
  assert.equal(totals.tax, 45.9);
  assert.equal(totals.total, 963.9);
});

test('CURRENT BEHAVIOUR: order #1004 invoice misses the SAVE10 discount cap and HSN slab', function () {
  const items = [
    { id: 5, sku: 'OIL-002', name: 'Cold-Pressed Groundnut Oil 5L', hsn: '1508', price: 1120, qty: 2 }
  ];
  const order = { id: 1004, items: items, coupon: 'SAVE10' };
  const figures = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(figures, {
    subtotal: 2240,
    discount: 264.32,
    tax: 403.2,
    cgst: 201.6,
    sgst: 201.6,
    total: 2378.88,
    rows: [
      { name: 'Cold-Pressed Groundnut Oil 5L', sku: 'OIL-002', hsn: '1508', qty: 2, price: 1120, gstPercent: 18, line: 2240, lineTax: 403.2 }
    ]
  });
  assert.equal(totals.discount, 150);
  assert.equal(totals.tax, 104.5);
  assert.equal(totals.total, 2194.5);
});

test('order #1008 invoice and pricing agree for items at the default 18% GST rate', function () {
  const items = [
    { id: 8, sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g', hsn: '0902', price: 140, qty: 1 },
    { id: 12, sku: 'BEV-003', name: 'Kokum Sherbet Concentrate 750ml', hsn: '2106', price: 180, qty: 2 }
  ];
  const order = { id: 1008, items: items, coupon: '' };
  const figures = invoice.computeInvoiceFigures(order);
  const totals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(figures, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Sherbet Concentrate 750ml', sku: 'BEV-003', hsn: '2106', price: 180, qty: 2, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.equal(totals.tax, 90);
  assert.equal(totals.total, 590);
});
