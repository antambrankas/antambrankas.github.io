export const GOLD_PRICE_API = 'https://logam-mulia-api.iamutaki.workers.dev/api/prices/brankaslm';

export function normalizePricePayload(payload) {
  if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
    throw new Error('Respons data harga emas tidak valid.');
  }

  const items = payload.data
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      source: item.source ?? '',
      material: item.material ?? '',
      materialType: item.materialType ?? 'Produk emas',
      weight: item.weight ?? null,
      weightUnit: item.weightUnit ?? '',
      sellPrice: item.sellPrice ?? null,
      buybackPrice: item.buybackPrice ?? null,
      currency: item.currency ?? 'IDR',
      recordedDate: item.recordedDate ?? '',
      displayName: item.displayName ?? 'Brankas LM',
      urlHomepage: item.urlHomepage ?? 'https://brankaslm.com',
    }));

  return {
    items,
    count: Number.isFinite(Number(payload.count)) ? Number(payload.count) : items.length,
    timestamp: payload.timestamp ?? null,
    cached: Boolean(payload.cached),
  };
}

export async function fetchGoldPrices(fetchImpl = fetch) {
  const response = await fetchImpl(GOLD_PRICE_API, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil harga emas (HTTP ${response.status}).`);
  }

  const payload = await response.json();
  return normalizePricePayload(payload);
}
