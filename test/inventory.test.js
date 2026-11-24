// Ticket: cannot sell the last sellable unit, and cancelling an order never restores stock.
const test = require('node:test');
const assert = require('node:assert/strict');
const inventory = require('../lib/inventory');
const orders = require('../lib/orders');
const { products: P, line } = require('./helpers');

function makeDb() {
  return {
    nextOrderId: 2001,
    customers: [],
    orders: [],
    products: [
      { id: 6, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', hsn: '0405', price: 450, stock: 1, reserved: 0 },
      { id: 11, sku: 'SPC-001', name: 'Byadgi Kashmiri Chilli Powder 500g', hsn: '0904', price: 220, stock: 4, reserved: 3 },
      { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', hsn: '1512', price: 190, stock: 22, reserved: 4 }
    ]
  };
}

test('sellable stock is stock minus reserved', () => {
  const db = makeDb();
  assert.equal(inventory.getSellableStock(db.products[0]), 1);
  assert.equal(inventory.getSellableStock(db.products[1]), 1);
  assert.equal(inventory.getSellableStock(db.products[2]), 18);
});

test('buying exactly the last sellable unit is allowed', () => {
  const db = makeDb();
  assert.deepEqual(inventory.check(db.products, [line(P.ghee, 1)]), { ok: true });
  assert.deepEqual(inventory.check(db.products, [line(P.chilli, 1)]), { ok: true });
});

test('more than the sellable quantity is refused; qty 0 passes the check', () => {
  const db = makeDb();
  assert.deepEqual(inventory.check(db.products, [line(P.ghee, 2)]), { ok: false, msg: 'A2 Gir Cow Ghee 500ml is out of stock (1 sellable available)' });
  assert.equal(inventory.check(db.products, [line(P.chilli, 2)]).ok, false);
  assert.equal(inventory.check(db.products, [line(P.ghee, 0)]).ok, true);
  assert.equal(inventory.check(db.products, [{ id: 999, qty: 1 }]).ok, false);
});

test('cancelling a pending order returns its items to stock exactly once', () => {
  const db = makeDb();
  const oil = db.products[2];
  const items = [line(P.sunOil, 2)];
  assert.deepEqual([oil.stock, oil.reserved], [22, 4]);

  inventory.reserve(db.products, items);
  assert.deepEqual([oil.stock, oil.reserved], [20, 4]);

  const order = orders.add(db, { status: 'pending', items: items, total: 399 });
  const r = orders.cancel(db, order.id, 'test');
  assert.equal(r.ok, true);
  assert.equal(order.status, 'cancelled');
  assert.deepEqual([oil.stock, oil.reserved], [22, 4]);

  assert.equal(orders.cancel(db, order.id).ok, false); // second cancel refused
  assert.deepEqual([oil.stock, oil.reserved], [22, 4]);
});
