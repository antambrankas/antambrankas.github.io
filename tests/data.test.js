import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchGoldPrices, normalizePricePayload } from '../src/data.js';

const payload = {
  success: true,
  data: [
    {
      source: 'brankaslm',
      material: 'gold',
      materialType: 'Emas Fisik',
      weight: 1,
      weightUnit: 'gr',
      sellPrice: 2598000,
      buybackPrice: null,
      currency: 'IDR',
      recordedDate: '2026-09-17',
      displayName: 'Brankas LM',
      urlHomepage: 'https://brankaslm.com',
    },
  ],
  count: 1,
  timestamp: '2026-09-17T03:48:33.894Z',
  cached: true,
};

test('normalizePricePayload keeps API rows and null buyback values intact', () => {
  const result = normalizePricePayload(payload);

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].materialType, 'Emas Fisik');
  assert.equal(result.items[0].buybackPrice, null);
  assert.equal(result.cached, true);
  assert.equal(result.timestamp, payload.timestamp);
});

test('normalizePricePayload rejects unsuccessful or malformed payloads', () => {
  assert.throws(
    () => normalizePricePayload({ success: false, data: [] }),
    /tidak valid/i,
  );
  assert.throws(
    () => normalizePricePayload({ success: true, data: 'wrong' }),
    /tidak valid/i,
  );
});

test('fetchGoldPrices returns normalized data for a successful HTTP response', async () => {
  const fakeFetch = async () => ({
    ok: true,
    json: async () => payload,
  });

  const result = await fetchGoldPrices(fakeFetch);
  assert.equal(result.items[0].sellPrice, 2598000);
});

test('fetchGoldPrices surfaces an HTTP failure', async () => {
  const fakeFetch = async () => ({ ok: false, status: 503 });

  await assert.rejects(
    () => fetchGoldPrices(fakeFetch),
    /503/,
  );
});
