// Ticket: Khata settlements corrupt customer balances.
const test = require('node:test');
const assert = require('node:assert/strict');
const ledger = require('../lib/ledger');

function makeDb() {
  return {
    nextSettlementId: 505,
    settlements: [],
    customers: [
      { id: 1, name: 'Meera Joshi', creditLimit: 5000, openingBalance: 450, totalBilled: 1982.01, totalSettled: 1200, balance: 1232.01 }
    ]
  };
}

test('numeric settlement of 500 reduces Meera\'s balance to ₹732.01', () => {
  const db = makeDb();
  const r = ledger.recordSettlement(db, 1, 500, 'upi', '');
  assert.equal(r.ok, true);
  assert.equal(db.customers[0].totalSettled, 1700);
  assert.equal(db.customers[0].balance, 732.01);
  assert.equal(db.settlements.length, 1);
  assert.equal(db.settlements[0].amount, 500);
});

test('CURRENT BEHAVIOUR: string "500" is concatenated into totalSettled', () => {
  const db = makeDb();
  const r = ledger.recordSettlement(db, 1, '500', 'upi', '');
  assert.equal(r.ok, true);
  assert.equal(db.customers[0].totalSettled, '1200500');
  assert.equal(db.customers[0].balance, -1198067.99);
});

test('zero and negative amounts are rejected', () => {
  [0, -50, '0', '-50'].forEach((amt) => {
    const db = makeDb();
    const r = ledger.recordSettlement(db, 1, amt, 'upi', '');
    assert.equal(r.ok, false, 'amount ' + JSON.stringify(amt));
    assert.equal(db.customers[0].totalSettled, 1200);
  });
});

test('CURRENT BEHAVIOUR: non-numeric amount is accepted and corrupts the balance', () => {
  const db = makeDb();
  const r = ledger.recordSettlement(db, 1, 'abc', 'upi', '');
  assert.equal(r.ok, true);
  assert.equal(db.customers[0].totalSettled, '1200abc');
  assert.ok(Number.isNaN(db.customers[0].balance));
});

test('unknown customer is rejected', () => {
  assert.equal(ledger.recordSettlement(makeDb(), 99, 500).ok, false);
});
