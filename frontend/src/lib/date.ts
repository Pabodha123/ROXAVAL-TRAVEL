// Shared date-display helpers — always Day/Month/Year (en-GB), regardless of browser locale.
// Storage/API format is untouched; this only controls what's rendered on screen.

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | number | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', opts ?? { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | number | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleString('en-GB', opts ?? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDateLong(value: string | number | Date | null | undefined): string {
  return formatDate(value, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateNumeric(value: string | number | Date | null | undefined): string {
  return formatDate(value, { day: '2-digit', month: '2-digit', year: 'numeric' });
}
