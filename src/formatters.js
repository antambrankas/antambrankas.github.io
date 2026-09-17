const unavailableLabel = 'Belum tersedia';

export function formatCurrency(value, currency = 'IDR') {
  if (value === null || value === undefined || value === '') {
    return unavailableLabel;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return unavailableLabel;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
    .format(numericValue)
    .replace(/\u00a0/g, ' ');
}

export function formatWeight(weight, unit = '') {
  const numericWeight = Number(weight);
  if (!Number.isFinite(numericWeight)) return '—';

  const normalizedUnit = String(unit).toLowerCase() === 'gr' ? 'gram' : unit;
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(numericWeight)} ${normalizedUnit}`.trim();
}

export function formatRecordedDate(value) {
  if (!value || typeof value !== 'string') return '—';

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '—';

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatTimestampWIB(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const parts = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Jakarta',
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('day')} ${get('month')} ${get('year')}, ${get('hour')}.${get('minute')} WIB`;
}
