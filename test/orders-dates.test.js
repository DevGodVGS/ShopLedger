// Ticket: order history sorting and date filter are broken.
const test = require('node:test');
const assert = require('node:assert/strict');
const orders = require('../lib/orders');
const dates = require('../lib/dates');

function makeDb() {
  return {
    orders: [
      { id: 1001, date: '28/12/2021', status: 'completed', items: [] },
      { id: 1002, date: '05/01/2022', status: 'completed', items: [] },
      { id: 1004, date: '30/01/2022', status: 'completed', items: [] },
      { id: 1005, date: '02/02/2022', status: 'completed', items: [] },
      { id: 1008, date: '15/03/2022', status: 'completed', items: [] }
    ]
  };
}

function ids(list) { return list.map((o) => o.id); }

test('CURRENT BEHAVIOUR: default order sorts DD/MM/YYYY as text, not newest first', () => {
  assert.deepEqual(ids(orders.list(makeDb(), {})), [1004, 1001, 1008, 1002, 1005]);
});

test('CURRENT BEHAVIOUR: from/to filters (YYYY-MM-DD) compare DD/MM/YYYY as text', () => {
  assert.deepEqual(ids(orders.list(makeDb(), { from: '2022-01-01' })), [1004, 1001, 1008, 1002, 1005]);
  assert.deepEqual(ids(orders.list(makeDb(), { to: '2022-01-31' })), [1004, 1001, 1008, 1002, 1005]);
  assert.deepEqual(ids(orders.list(makeDb(), { from: '2022-02-01', to: '2022-02-28' })), [1008, 1002, 1005]);
});

test('CURRENT BEHAVIOUR: normalizeDateKey turns YYYY-MM-DD into DD/MM/YYYY', () => {
  assert.equal(dates.normalizeDateKey('2022-03-15'), '15/03/2022');
  assert.equal(dates.normalizeDateKey('15/03/2022'), '15/03/2022');
  assert.equal(dates.normalizeDateKey(''), '');
});

test('getFiscalYear works for both date formats', () => {
  assert.equal(dates.getFiscalYear('15/03/2022'), 'FY21-22');
  assert.equal(dates.getFiscalYear('2022-04-01'), 'FY22-23');
});

test('status and search filters', () => {
  const db = makeDb();
  db.orders[1].status = 'cancelled';
  assert.deepEqual(ids(orders.list(db, { status: 'cancelled' })), [1002]);
  assert.deepEqual(ids(orders.list(db, { search: '1008' })), [1008]);
});
