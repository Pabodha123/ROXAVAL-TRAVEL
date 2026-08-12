// Shared date-display helper — always Day/Month/Year (en-GB), regardless of server locale.
// Storage/API format is untouched; this only controls what's rendered in PDFs/emails.

function formatDate(value, opts) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', opts || { day: '2-digit', month: 'short', year: 'numeric' });
}

module.exports = { formatDate };
