// Single source of truth for the WhatsApp contact number used across the site
// (floating button, package/activity CTAs, custom tour CTA).
export const WHATSAPP_NUMBER = '94771234567';

export function whatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
