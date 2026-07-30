
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPinIcon, PhoneIcon, MailIcon, MessageCircleIcon,
  FacebookIcon, InstagramIcon, YoutubeIcon, MusicIcon, SendIcon } from
'lucide-react';

const socials = [
{ icon: FacebookIcon, label: 'Facebook' },
{ icon: InstagramIcon, label: 'Instagram' },
{ icon: YoutubeIcon, label: 'YouTube' },
{ icon: MusicIcon, label: 'TikTok' }];


export function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.packages'), href: '/packages' },
    { label: t('nav.destinations'), href: '/destinations' },
    { label: t('nav.activities'), href: '/activities' },
    { label: t('nav.aboutUs'), href: '/about' },
    { label: t('nav.contactUs'), href: '/contact' },
    { label: t('nav.blog'), href: '/blog' },
  ];

  const exploreMoreLinks = [
    { label: t('footer.tailorMadeTours'), href: '/packages#custom-tour' },
    { label: t('nav.reviews'), href: '/reviews' },
    { label: t('nav.terms'), href: '/terms' },
    { label: t('footer.privacyPolicy'), href: null },
    { label: t('footer.faq'), href: null },
  ];

  return (
    <footer className="relative bg-forest text-cream">
      {/* Newsletter strip */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -translate-y-14 rounded-3xl bg-emerald p-8 sm:p-10 shadow-lift overflow-hidden">
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white">{t('footer.newsletterTitle')}</h3>
              <p className="mt-2 text-cream/80 text-sm">{t('footer.newsletterSubtitle')}</p>
            </div>
            <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 md:w-72 rounded-full bg-white/95 px-5 py-3.5 text-sm text-forest placeholder:text-forest/50 focus:outline-none focus:ring-2 focus:ring-gold" />

              <button className="flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-105 active:scale-95">
                {t('footer.subscribe')} <SendIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 -mt-4">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/roxaval-icon.png" alt="" className="h-10 w-10 object-contain" />
              <span className="font-display text-xl font-semibold text-white">Roxaval Travels</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              {t('footer.companyBlurb')}
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) =>
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid place-items-center h-10 w-10 rounded-full bg-white/10 text-cream hover:bg-gold hover:text-forest transition-colors">
                
                  <s.icon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white">{t('footer.quickLinks')}</h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((l) =>
              <li key={l.label}>
                  <Link to={l.href} className="text-sm text-cream/70 hover:text-gold transition-colors">{l.label}</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white">{t('footer.contactUs')}</h4>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li className="flex gap-3"><MapPinIcon className="h-5 w-5 text-gold shrink-0" /> No 221 Ganemulla Road, Kandana, Sri Lanka</li>
              <li className="flex gap-3"><PhoneIcon className="h-5 w-5 text-gold shrink-0" /> +94 11 234 5678</li>
              <li className="flex gap-3"><MessageCircleIcon className="h-5 w-5 text-gold shrink-0" /> {t('footer.whatsapp')}: +94 77 123 4567</li>
              <li className="flex gap-3"><MailIcon className="h-5 w-5 text-gold shrink-0" /> hello@roxavaltravels.com</li>
            </ul>
          </div>

          {/* Explore more */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white">{t('footer.exploreMore')}</h4>
            <ul className="mt-4 space-y-2.5">
              {exploreMoreLinks.map((l) =>
              <li key={l.label}>
                  {l.href ?
                <Link to={l.href} className="text-sm text-cream/70 hover:text-gold transition-colors">{l.label}</Link> :

                <span className="text-sm text-cream/40">{l.label}</span>
                }
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/50">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p className="text-xs text-cream/50">{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>);

}