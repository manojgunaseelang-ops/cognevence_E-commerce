const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeProductReference } = require('../utils/productReference');

test('prefers _id for standard MongoDB products', () => {
  const value = normalizeProductReference({ _id: '507f1f77bcf86cd799439011' });
  assert.equal(value, '507f1f77bcf86cd799439011');
});

test('supports string-based product ids used by newer products', () => {
  const value = normalizeProductReference({ id: 'SHOE-1001' });
  assert.equal(value, 'SHOE-1001');
});

test('falls back to slug when no id is available', () => {
  const value = normalizeProductReference({ slug: 'new-product' });
  assert.equal(value, 'new-product');
});
