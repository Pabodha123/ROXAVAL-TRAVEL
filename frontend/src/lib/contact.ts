// Single source of truth for the WhatsApp contact number used across the site
// (floating button, package/activity CTAs, custom tour CTA, footer).
export const WHATSAPP_NUMBER = '971542642902';
export const WHATSAPP_DISPLAY = '+971 54 264 2902';

export function whatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
