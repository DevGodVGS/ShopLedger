// Shared in-memory fixtures for tests. Never touches data/db.json.
// Line items match what routes/orders.js stores: { id, sku, name, hsn, price, qty }.
const products = {
  rice:   { id: 1,  sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg',        hsn: '1006', price: 640 },
  dal:    { id: 2,  sku: 'GRN-002', name: 'Unpolished Toor Dal 1kg',           hsn: '0713', price: 165 },
  sunOil: { id: 4,  sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L',     hsn: '1512', price: 190 },
  gnOil:  { id: 5,  sku: 'OIL-002', name: 'Cold-Pressed Groundnut Oil 5L',     hsn: '1508', price: 1120 },
  ghee:   { id: 6,  sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml',             hsn: '0405', price: 450 },
  tea:    { id: 8,  sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g',        hsn: '0902', price: 140 },
  chilli: { id: 11, sku: 'SPC-001', name: 'Byadgi Kashmiri Chilli Powder 500g', hsn: '0904', price: 220 },
  kokum:  { id: 12, sku: 'BEV-003', name: 'Kokum Sherbet Concentrate 750ml',   hsn: '2106', price: 180 }
};

exports.products = products;

exports.line = function (p, qty) {
  return { id: p.id, sku: p.sku, name: p.name, hsn: p.hsn, price: p.price, qty: qty };
};
