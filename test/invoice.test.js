const assert = require('node:assert/strict');
const test = require('node:test');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

const orders = [
  {
    id: 1001,
    coupon: '',
    items: [
      { id: 8, sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g', hsn: '0902', price: 140, qty: 2 },
      { id: 2, sku: 'GRN-002', name: 'Unpolished Toor Dal 1kg', hsn: '0713', price: 165, qty: 2 }
    ]
  },
  {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { id: 1, sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg', hsn: '1006', price: 640, qty: 1 },
      { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', hsn: '1512', price: 190, qty: 2 }
    ]
  },
  {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { id: 5, sku: 'OIL-002', name: 'Cold-Pressed Groundnut Oil 5L', hsn: '1508', price: 1120, qty: 2 }
    ]
  },
  {
    id: 1008,
    coupon: '',
    items: [
      { id: 8, sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g', hsn: '0902', price: 140, qty: 1 },
      { id: 12, sku: 'BEV-003', name: 'Kokum Sherbet Concentrate 750ml', hsn: '2106', price: 180, qty: 2 }
    ]
  }
];

orders.forEach(function (order) {
  test('order #' + order.id + ' invoice matches checkout totals and per-line GST', function () {
    const figures = invoice.computeInvoiceFigures(order);
    const totals = pricing.computeTotals(order.items, order.coupon);

    assert.deepEqual({
      subtotal: figures.subtotal,
      discount: figures.discount,
      tax: figures.tax,
      cgst: figures.cgst,
      sgst: figures.sgst,
      total: figures.total
    }, {
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      cgst: totals.cgst,
      sgst: totals.sgst,
      total: totals.total
    });

    assert.deepEqual(figures.rows.map(function (row) {
      return { hsn: row.hsn, gstPercent: row.gstPercent, line: row.line, lineTax: row.lineTax };
    }), totals.lines.map(function (line) {
      return { hsn: line.hsn, gstPercent: line.gstPercent, line: line.gross, lineTax: line.tax };
    }));

    const html = invoice.render(order);
    assert.match(html, new RegExp('₹' + totals.total.toFixed(2) + '</td>'));
  });
});

test('order #1004 SAVE10 discount is capped before GST is calculated', function () {
  const order = orders.find(function (entry) { return entry.id === 1004; });
  const figures = invoice.computeInvoiceFigures(order);

  assert.equal(figures.discount, 150);
  assert.equal(figures.tax, 104.5);
  assert.equal(figures.total, 2194.5);
});
