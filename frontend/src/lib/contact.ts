// Single source of truth for contact details used across the site
// (floating button, package/activity CTAs, custom tour CTA, footer, contact page).
export const WHATSAPP_NUMBER = '971542642902';
export const WHATSAPP_DISPLAY = '+971 54 264 2902';

export const WHATSAPP_NUMBER_SL = '94778803522';
export const WHATSAPP_DISPLAY_SL = '+94 77 880 3522';

export const CONTACT_EMAIL = 'info@roxavaltravels.com';
export const WEBSITE_DISPLAY = 'www.roxavaltravels.com';
export const WEBSITE_URL = 'https://www.roxavaltravels.com';

export const ADDRESS_SRI_LANKA = 'No 221 Ganemulla Road, Kandana, Sri Lanka';
export const ADDRESS_UAE = 'Sharjah Publishing City Free Zone, Sharjah, UAE';

export function whatsAppLink(message?: string, number: string = WHATSAPP_NUMBER): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
