import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import commonDe from './locales/de/common.json';
import commonFr from './locales/fr/common.json';
import homeEn from './locales/en/home.json';
import homeDe from './locales/de/home.json';
import homeFr from './locales/fr/home.json';
import packagesEn from './locales/en/packages.json';
import packagesDe from './locales/de/packages.json';
import packagesFr from './locales/fr/packages.json';
import destinationsEn from './locales/en/destinations.json';
import destinationsDe from './locales/de/destinations.json';
import destinationsFr from './locales/fr/destinations.json';
import activitiesEn from './locales/en/activities.json';
import activitiesDe from './locales/de/activities.json';
import activitiesFr from './locales/fr/activities.json';
import authEn from './locales/en/auth.json';
import authDe from './locales/de/auth.json';
import authFr from './locales/fr/auth.json';
import bookingEn from './locales/en/booking.json';
import bookingDe from './locales/de/booking.json';
import bookingFr from './locales/fr/booking.json';
import dashboardEn from './locales/en/dashboard.json';
import dashboardDe from './locales/de/dashboard.json';
import dashboardFr from './locales/fr/dashboard.json';
import quotationEn from './locales/en/quotation.json';
import quotationDe from './locales/de/quotation.json';
import quotationFr from './locales/fr/quotation.json';
import blogEn from './locales/en/blog.json';
import blogDe from './locales/de/blog.json';
import blogFr from './locales/fr/blog.json';
import reviewsEn from './locales/en/reviews.json';
import reviewsDe from './locales/de/reviews.json';
import reviewsFr from './locales/fr/reviews.json';
import termsEn from './locales/en/terms.json';
import termsDe from './locales/de/terms.json';
import termsFr from './locales/fr/terms.json';
import contactEn from './locales/en/contact.json';
import contactDe from './locales/de/contact.json';
import contactFr from './locales/fr/contact.json';
import aboutEn from './locales/en/about.json';
import aboutDe from './locales/de/about.json';
import aboutFr from './locales/fr/about.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const STORAGE_KEY = 'roxaval_lang';

function detectInitialLanguage(): SupportedLanguageCode {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored as SupportedLanguageCode;

  const browserLang = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'en';
  if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) return browserLang as SupportedLanguageCode;

  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: commonEn, home: homeEn, packages: packagesEn, destinations: destinationsEn, activities: activitiesEn, auth: authEn, booking: bookingEn, dashboard: dashboardEn, quotation: quotationEn, blog: blogEn, reviews: reviewsEn, terms: termsEn, contact: contactEn, about: aboutEn },
    de: { common: commonDe, home: homeDe, packages: packagesDe, destinations: destinationsDe, activities: activitiesDe, auth: authDe, booking: bookingDe, dashboard: dashboardDe, quotation: quotationDe, blog: blogDe, reviews: reviewsDe, terms: termsDe, contact: contactDe, about: aboutDe },
    fr: { common: commonFr, home: homeFr, packages: packagesFr, destinations: destinationsFr, activities: activitiesFr, auth: authFr, booking: bookingFr, dashboard: dashboardFr, quotation: quotationFr, blog: blogFr, reviews: reviewsFr, terms: termsFr, contact: contactFr, about: aboutFr },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'home', 'packages', 'destinations', 'activities', 'auth', 'booking', 'dashboard', 'quotation', 'blog', 'reviews', 'terms', 'contact', 'about'],
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

// Every language change instantly re-renders subscribed components (no
// reload) via react-i18next; here we also persist the choice and keep
// <html lang> in sync for accessibility/SEO.
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, lng);
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});

export function getCurrentLanguage(): SupportedLanguageCode {
  return (i18n.language?.slice(0, 2) as SupportedLanguageCode) || 'en';
}

export default i18n;
