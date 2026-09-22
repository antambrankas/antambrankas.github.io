export const GOLD_PRICE_API =
  "https://logam-mulia-api.iamutaki.workers.dev/api/prices/brankaslm";

const CACHE_KEY = "gold-price-cache-v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function normalizePricePayload(payload) {
  if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
    throw new Error("Respons data harga emas tidak valid.");
  }

  const items = payload.data
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      source: item.source ?? "",
      material: item.material ?? "",
      materialType: item.materialType ?? "Produk emas",
      weight: item.weight ?? null,
      weightUnit: item.weightUnit ?? "",
      sellPrice: item.sellPrice ?? null,
      buybackPrice: item.buybackPrice ?? null,
      currency: item.currency ?? "IDR",
      recordedDate: item.recordedDate ?? "",
      displayName: item.displayName ?? "Brankas LM",
      urlHomepage: item.urlHomepage ?? "https://brankaslm.com",
    }));

  return {
    items,
    count: Number.isFinite(Number(payload.count))
      ? Number(payload.count)
      : items.length,
    timestamp: payload.timestamp ?? null,
    cached: Boolean(payload.cached),
  };
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);

    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw);

    if (!cached || !cached.savedAt || !cached.data) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    const cacheAge = Date.now() - cached.savedAt;

    if (cacheAge > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return {
      ...cached.data,
      cached: true,
    };
  } catch (error) {
    console.warn("Failed to read gold price cache:", error);

    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore localStorage error
    }

    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        data,
      }),
    );
  } catch (error) {
    console.warn("Failed to save gold price cache:", error);
  }
}

export function clearGoldPriceCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear gold price cache:", error);
  }
}

export async function fetchGoldPrices(fetchImpl = fetch, options = {}) {
  const { forceRefresh = false } = options;

  /*
   * Normal page load:
   * Try cache first.
   *
   * Manual refresh:
   * forceRefresh = true, so cache is skipped.
   */
  if (!forceRefresh) {
    const cachedData = readCache();

    if (cachedData) {
      return cachedData;
    }
  }

  const response = await fetchImpl(GOLD_PRICE_API, {
    headers: {
      Accept: "application/json",
    },

    /*
     * We deliberately keep no-store here because
     * caching is controlled by our own localStorage logic.
     */
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil harga emas (HTTP ${response.status}).`);
  }

  const payload = await response.json();

  const data = normalizePricePayload(payload);

  /*
   * Save latest successful API response.
   */
  writeCache(data);

  return {
    ...data,
    cached: false,
  };
}
