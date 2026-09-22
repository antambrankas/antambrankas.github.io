import "./style.css";

import { fetchGoldPrices } from "./data.js";
import { formatPricePerUnit, formatTimestampWIB } from "./formatters.js";

const elements = {
  priceGrid: document.querySelector("#priceGrid"),
  statusRegion: document.querySelector("#statusRegion"),
  lastUpdated: document.querySelector("#lastUpdated"),
  refreshButton: document.querySelector("#refreshButton"),
  refreshIcon: document.querySelector("#refreshIcon"),
  refreshText: document.querySelector("#refreshText"),
  sourceLink: document.querySelector("#sourceLink"),
};

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createProductIcon(item) {
  const icon = createElement(
    "div",
    "grid size-14 place-items-center rounded-2xl bg-gold-50 text-gold-600 sm:size-16",
  );

  const isBrankas = String(item.materialType).toLowerCase().includes("brankas");

  icon.innerHTML = isBrankas
    ? `<svg viewBox="0 0 64 64" class="size-10 sm:size-11" aria-hidden="true">
        <rect x="8" y="10" width="40" height="43" rx="8" fill="currentColor" opacity=".22"/>
        <rect x="12" y="14" width="36" height="35" rx="6" fill="currentColor" opacity=".38"/>
        <circle cx="30" cy="31" r="9" fill="none" stroke="currentColor" stroke-width="4"/>
        <circle cx="30" cy="31" r="2.5" fill="currentColor"/>
        <path d="M30 22v5m0 8v5m-9-9h5m8 0h5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="43" y="29" width="13" height="25" rx="4" fill="#e8b744"/>
        <path d="M49.5 35.5l1.7 2.4 2.7-.2-1.6 2.2.9 2.6-2.7-.8-2.2 1.6.1-2.8-2.2-1.6 2.7-.8.6-2.6Z" fill="#9b7019" opacity=".85"/>
      </svg>`
    : `<svg viewBox="0 0 64 64" class="size-10 sm:size-11" aria-hidden="true">
        <path d="M14 28h28l7 18H7l7-18Z" fill="currentColor" opacity=".42"/>
        <path d="M22 15h27l7 18H15l7-18Z" fill="currentColor" opacity=".62"/>
        <path d="M29 8h22l6 15H23l6-15Z" fill="currentColor"/>
        <path d="M34 12h12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".65"/>
      </svg>`;

  return icon;
}

function renderLoading() {
  elements.priceGrid.replaceChildren();
  elements.priceGrid.setAttribute("aria-busy", "true");

  for (let index = 0; index < 2; index += 1) {
    const card = createElement(
      "div",
      "rounded-2xl border border-line bg-white p-3.5 shadow-card sm:p-5",
    );
    card.setAttribute("aria-hidden", "true");

    const icon = createElement(
      "div",
      "skeleton-shimmer size-14 rounded-2xl sm:size-16",
    );
    const title = createElement(
      "div",
      "skeleton-shimmer mt-5 h-4 w-3/4 rounded-full",
    );
    const price = createElement(
      "div",
      "skeleton-shimmer mt-4 h-5 w-full rounded-md",
    );
    card.append(icon, title, price);
    elements.priceGrid.append(card);
  }

  setRefreshState(true);
  elements.lastUpdated.textContent = "Mengambil harga terbaru…";
  elements.statusRegion.textContent = "Sedang mengambil harga emas terbaru.";
}

function createPriceCard(item) {
  const card = createElement(
    "article",
    "price-card min-w-0 rounded-2xl border border-line bg-white p-3.5 shadow-card sm:p-5",
  );

  const icon = createProductIcon(item);
  const title = createElement(
    "h2",
    "mt-5 min-h-10 text-[0.92rem] font-semibold leading-5 tracking-[-0.015em] text-ink sm:min-h-0 sm:text-base",
    item.materialType,
  );
  const price = createElement(
    "p",
    "compact-price mt-3 whitespace-nowrap font-bold leading-none tracking-[-0.035em] text-ink",
    formatPricePerUnit(item.sellPrice, item.currency, item.weightUnit),
  );

  card.append(icon, title, price);
  return card;
}

function renderSuccess(data) {
  elements.priceGrid.replaceChildren();
  elements.priceGrid.setAttribute("aria-busy", "false");

  if (data.items.length === 0) {
    renderEmpty();
    return;
  }

  data.items.forEach((item) => {
    elements.priceGrid.append(createPriceCard(item));
  });

  const firstItem = data.items[0];
  const updatedText = formatTimestampWIB(data.timestamp);
  elements.lastUpdated.textContent = `Terakhir diperbarui ${updatedText}`;

  if (firstItem.urlHomepage) {
    elements.sourceLink.href = firstItem.urlHomepage;
  }

  setRefreshState(false);
  elements.statusRegion.textContent = `${data.items.length} harga emas berhasil dimuat. Terakhir diperbarui ${updatedText}.`;
}

function renderEmpty() {
  const wrapper = createElement(
    "div",
    "col-span-2 rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-center shadow-card",
  );
  const title = createElement(
    "h2",
    "text-sm font-semibold text-ink",
    "Harga belum tersedia",
  );
  const copy = createElement(
    "p",
    "mt-1.5 text-xs leading-5 text-muted",
    "Coba perbarui kembali beberapa saat lagi.",
  );
  wrapper.append(title, copy);
  elements.priceGrid.append(wrapper);
  elements.priceGrid.setAttribute("aria-busy", "false");
  setRefreshState(false);
  elements.lastUpdated.textContent = "Belum ada data harga";
  elements.statusRegion.textContent =
    "Belum ada data harga emas yang tersedia.";
}

function renderError(error) {
  elements.priceGrid.replaceChildren();
  elements.priceGrid.setAttribute("aria-busy", "false");

  const wrapper = createElement(
    "div",
    "col-span-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-7 text-center",
  );
  const title = createElement(
    "h2",
    "text-sm font-semibold text-red-950",
    "Harga belum dapat dimuat",
  );
  const copy = createElement(
    "p",
    "mt-1.5 text-xs leading-5 text-red-800/80",
    "Periksa koneksi lalu tekan tombol perbarui.",
  );
  wrapper.append(title, copy);
  elements.priceGrid.append(wrapper);

  elements.lastUpdated.textContent = "Pembaruan gagal";
  setRefreshState(false);
  elements.statusRegion.textContent =
    `Gagal mengambil data harga emas. ${error?.message || ""}`.trim();
}

function setRefreshState(isLoading) {
  elements.refreshButton.disabled = isLoading;
  elements.refreshButton.setAttribute(
    "aria-label",
    isLoading ? "Sedang memperbarui harga" : "Perbarui harga",
  );
  elements.refreshText.textContent = isLoading
    ? "Memperbarui harga"
    : "Perbarui harga";
  elements.refreshIcon.classList.toggle("is-spinning", isLoading);
}

async function loadPrices({ forceRefresh = false } = {}) {
  renderLoading();

  try {
    const data = await fetchGoldPrices(fetch, {
      forceRefresh,
    });

    renderSuccess(data);
  } catch (error) {
    console.error(error);
    renderError(error);
  }
}

/*
 * Manual refresh should always get latest data
 * from the API.
 */
elements.refreshButton.addEventListener("click", () => {
  loadPrices({
    forceRefresh: true,
  });
});

/*
 * Initial page load.
 *
 * This will use cached data when:
 * - cache exists
 * - cache age <= 5 minutes
 *
 * Otherwise it will call the API.
 */
loadPrices();
