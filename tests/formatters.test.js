import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatCurrency,
  formatRecordedDate,
  formatTimestampWIB,
  formatWeight,
} from '../src/formatters.js';

test('formatCurrency formats Indonesian rupiah clearly', () => {
  assert.equal(formatCurrency(2598000, 'IDR'), 'Rp 2.598.000');
});

test('formatCurrency returns unavailable copy for null values', () => {
  assert.equal(formatCurrency(null, 'IDR'), 'Belum tersedia');
});

test('formatWeight formats a one gram product', () => {
  assert.equal(formatWeight(1, 'gr'), '1 gram');
});

test('formatRecordedDate formats YYYY-MM-DD without timezone shifting', () => {
  assert.equal(formatRecordedDate('2026-09-17'), '17 September 2026');
});

test('formatTimestampWIB converts API UTC timestamp to Asia/Jakarta time', () => {
  assert.equal(formatTimestampWIB('2026-09-17T03:48:33.894Z'), '17 Sep 2026, 10.48 WIB');
});
