import './style.css';

import { fetchGoldPrices } from './data.js';
import {
  formatCurrency,
  formatRecordedDate,
  formatTimestampWIB,
  formatWeight,
} from './formatters.js';

const elements = {
  priceGrid: document.querySelector('#priceGrid'),
  statusRegion: document.querySelector('#statusRegion'),
  lastUpdated: document.querySelector('#lastUpdated'),
  refreshButton: document.querySelector('#refreshButton'),
  refreshIcon: document.querySelector('#refreshIcon'),
  refreshText: document.querySelector('#refreshText'),
  connectionBadge: document.querySelector('#connectionBadge'),
  connectionDot: document.querySelector('#connectionDot'),
  connectionText: document.querySelector('#connectionText'),
  sourceLink: document.querySelector('#sourceLink'),
  summarySource: document.querySelector('#summarySource'),
  summaryDate: document.querySelector('#summaryDate'),
  summaryCache: document.querySelector('#summaryCache'),
};

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderLoading() {
  elements.priceGrid.replaceChildren();
  elements.priceGrid.setAttribute('aria-busy', 'true');

  for (let index = 0; index < 2; index += 1) {
    const card = createElement('div', 'rounded-2xl border border-line bg-white/70 p-5 sm:p-6');
    card.setAttribute('aria-hidden', 'true');

    const line1 = createElement('div', 'skeleton-shimmer h-3 w-24 rounded-full');
    const line2 = createElement('div', 'skeleton-shimmer mt-4 h-5 w-40 rounded-full');
    const line3 = createElement('div', 'skeleton-shimmer mt-8 h-9 w-52 max-w-full rounded-lg');
    const line4 = createElement('div', 'skeleton-shimmer mt-7 h-12 w-full rounded-xl');

    card.append(line1, line2, line3, line4);
    elements.priceGrid.append(card);
  }

  setConnectionState('loading');
  setRefreshState(true);
  elements.statusRegion.textContent = 'Sedang mengambil harga emas terbaru.';
}

function createPriceCard(item) {
  const card = createElement('article', 'price-card rounded-2xl border border-line bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6');

  const top = createElement('div', 'flex items-start justify-between gap-4');
  const identity = createElement('div', 'min-w-0');
  const source = createElement('p', 'text-xs font-semibold uppercase tracking-[0.14em] text-gold-700', item.displayName);
  const title = createElement('h3', 'mt-2 text-lg font-semibold leading-snug tracking-tight text-ink', item.materialType);
  identity.append(source, title);

  const weight = createElement('span', 'shrink-0 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-muted', formatWeight(item.weight, item.weightUnit));
  top.append(identity, weight);

  const priceBlock = createElement('div', 'mt-8');
  const priceLabel = createElement('p', 'text-xs font-medium text-muted', 'Harga jual');
  const price = createElement('p', 'mt-1.5 text-[2rem] font-semibold leading-none tracking-[-0.04em] text-ink sm:text-4xl', formatCurrency(item.sellPrice, item.currency));
  priceBlock.append(priceLabel, price);

  const details = createElement('dl', 'mt-7 grid grid-cols-2 gap-3');

  const buybackWrap = createElement('div', 'rounded-xl bg-canvas/80 p-3.5');
  const buybackLabel = createElement('dt', 'text-[11px] font-medium uppercase tracking-[0.12em] text-muted', 'Buyback');
  const buybackValue = createElement('dd', 'mt-1.5 text-sm font-semibold text-ink', formatCurrency(item.buybackPrice, item.currency));
  buybackWrap.append(buybackLabel, buybackValue);

  const dateWrap = createElement('div', 'rounded-xl bg-canvas/80 p-3.5');
  const dateLabel = createElement('dt', 'text-[11px] font-medium uppercase tracking-[0.12em] text-muted', 'Tanggal');
  const dateValue = createElement('dd', 'mt-1.5 text-sm font-semibold text-ink', formatRecordedDate(item.recordedDate));
  dateWrap.append(dateLabel, dateValue);

  details.append(buybackWrap, dateWrap);
  card.append(top, priceBlock, details);
  return card;
}

function renderSuccess(data) {
  elements.priceGrid.replaceChildren();
  elements.priceGrid.setAttribute('aria-busy', 'false');

  if (data.items.length === 0) {
    renderEmpty();
    return;
  }

  data.items.forEach((item) => {
    elements.priceGrid.append(createPriceCard(item));
  });

  const firstItem = data.items[0];
  const updatedText = formatTimestampWIB(data.timestamp);
  elements.lastUpdated.textContent = `Diperbarui ${updatedText}`;
  elements.summarySource.textContent = firstItem.displayName || 'Brankas LM';
  elements.summaryDate.textContent = formatRecordedDate(firstItem.recordedDate);
  elements.summaryCache.textContent = data.cached ? 'Data cache API' : 'Respons terbaru API';

  if (firstItem.urlHomepage) {
    elements.sourceLink.href = firstItem.urlHomepage;
  }

  setConnectionState(data.cached ? 'cached' : 'live');
  setRefreshState(false);
  elements.statusRegion.textContent = `${data.items.length} harga emas berhasil dimuat. Diperbarui ${updatedText}.`;
}

function renderEmpty() {
  const wrapper = createElement('div', 'md:col-span-2 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center');
  const icon = createElement('div', 'mx-auto grid size-11 place-items-center rounded-full bg-gold-50 text-gold-700');
  icon.innerHTML = '<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true"><path fill="currentColor" d="M11 7h2v6h-2zm0 8h2v2h-2z"/></svg>';
  const title = createElement('h3', 'mt-4 text-base font-semibold text-ink', 'Belum ada harga yang tersedia');
  const copy = createElement('p', 'mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted', 'API merespons dengan sukses, tetapi belum mengembalikan daftar harga. Coba perbarui beberapa saat lagi.');
  wrapper.append(icon, title, copy);
  elements.priceGrid.append(wrapper);
  elements.priceGrid.setAttribute('aria-busy', 'false');
  setConnectionState('empty');
  setRefreshState(false);
  elements.statusRegion.textContent = 'Belum ada data harga emas yang tersedia.';
}

function renderError(error) {
  elements.priceGrid.replaceChildren();
  elements.priceGrid.setAttribute('aria-busy', 'false');

  const wrapper = createElement('div', 'md:col-span-2 rounded-2xl border border-red-200 bg-red-50/70 px-5 py-9 text-center sm:px-8');
  const icon = createElement('div', 'mx-auto grid size-11 place-items-center rounded-full bg-red-100 text-red-700');
  icon.innerHTML = '<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true"><path fill="currentColor" d="M12 2 1 21h22L12 2Zm0 6 5.5 10h-11L12 8Zm-1 3v3h2v-3h-2Zm0 4v2h2v-2h-2Z"/></svg>';
  const title = createElement('h3', 'mt-4 text-base font-semibold text-red-950', 'Harga belum dapat dimuat');
  const copy = createElement('p', 'mx-auto mt-1.5 max-w-lg text-sm leading-6 text-red-800/80', 'Periksa koneksi internet atau coba kembali. Jika masalah berlanjut, sumber API mungkin sedang tidak tersedia.');
  const detail = createElement('p', 'mx-auto mt-3 max-w-lg break-words text-xs text-red-700/70', error?.message || 'Terjadi kesalahan yang tidak diketahui.');
  wrapper.append(icon, title, copy, detail);
  elements.priceGrid.append(wrapper);

  elements.lastUpdated.textContent = 'Pembaruan gagal';
  elements.summaryCache.textContent = 'Tidak tersedia';
  setConnectionState('error');
  setRefreshState(false);
  elements.statusRegion.textContent = 'Gagal mengambil data harga emas.';
}

function setConnectionState(state) {
  const states = {
    loading: { label: 'Memuat data', dot: 'bg-slate-300', badge: 'border-line bg-white/70 text-muted' },
    live: { label: 'Data terbaru', dot: 'bg-emerald-500', badge: 'border-emerald-200 bg-emerald-50/80 text-emerald-800' },
    cached: { label: 'Data cache', dot: 'bg-amber-500', badge: 'border-amber-200 bg-amber-50/80 text-amber-800' },
    empty: { label: 'Data kosong', dot: 'bg-slate-400', badge: 'border-line bg-white/70 text-muted' },
    error: { label: 'Tidak terhubung', dot: 'bg-red-500', badge: 'border-red-200 bg-red-50/80 text-red-800' },
  };

  const selected = states[state] ?? states.loading;
  elements.connectionText.textContent = selected.label;
  elements.connectionDot.className = `size-2 rounded-full ${selected.dot}`;
  elements.connectionBadge.className = `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur ${selected.badge}`;
}

function setRefreshState(isLoading) {
  elements.refreshButton.disabled = isLoading;
  elements.refreshText.textContent = isLoading ? 'Memperbarui…' : 'Perbarui harga';
  elements.refreshIcon.classList.toggle('is-spinning', isLoading);
}

async function loadPrices() {
  renderLoading();

  try {
    const data = await fetchGoldPrices();
    renderSuccess(data);
  } catch (error) {
    console.error(error);
    renderError(error);
  }
}

elements.refreshButton.addEventListener('click', loadPrices);

loadPrices();
