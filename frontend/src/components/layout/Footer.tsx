
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPinIcon, MailIcon, MessageCircleIcon, GlobeIcon,
  FacebookIcon, InstagramIcon, YoutubeIcon, MusicIcon, SendIcon, CheckIcon } from
'lucide-react';
import { apiPost } from '../../lib/api';
import {
  WHATSAPP_DISPLAY, WHATSAPP_NUMBER_SL, WHATSAPP_DISPLAY_SL, whatsAppLink,
  CONTACT_EMAIL, WEBSITE_DISPLAY, WEBSITE_URL, ADDRESS_SRI_LANKA, ADDRESS_UAE } from
'../../lib/contact';

const socials = [
{ icon: FacebookIcon, label: 'Facebook' },
{ icon: InstagramIcon, label: 'Instagram' },
{ icon: YoutubeIcon, label: 'YouTube' },
{ icon: MusicIcon, label: 'TikTok' }];


export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await apiPost('/newsletter', { email });
      setStatus('submitted');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

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
            {status === 'submitted' ?
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold text-white">
              <CheckIcon className="h-4 w-4 text-gold" /> {t('footer.subscribeSuccess', 'Thanks for subscribing!')}
            </div> :

            <form className="flex w-full flex-col md:w-auto md:flex-row gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 md:w-72 rounded-full bg-white/95 px-5 py-3.5 text-sm text-forest placeholder:text-forest/50 focus:outline-none focus:ring-2 focus:ring-gold" />

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-105 active:scale-95 disabled:opacity-70">
                {status === 'submitting' ? t('footer.subscribing', 'Subscribing...') : t('footer.subscribe')} <SendIcon className="h-4 w-4" />
              </button>
            </form>
            }
          </div>
          {status === 'error' &&
          <p className="relative mt-3 text-sm text-red-200">{t('footer.subscribeError', 'Something went wrong. Please try again.')}</p>
          }
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
              <li className="flex gap-3"><MapPinIcon className="h-5 w-5 text-gold shrink-0" /> {ADDRESS_SRI_LANKA}</li>
              <li className="flex gap-3"><MapPinIcon className="h-5 w-5 text-gold shrink-0" /> {ADDRESS_UAE}</li>
              <li className="flex gap-3">
                <MessageCircleIcon className="h-5 w-5 text-gold shrink-0" />
                <a href={whatsAppLink(undefined, WHATSAPP_NUMBER_SL)} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">
                  {t('footer.whatsapp')} (Sri Lanka): {WHATSAPP_DISPLAY_SL}
                </a>
              </li>
              <li className="flex gap-3">
                <MessageCircleIcon className="h-5 w-5 text-gold shrink-0" />
                <a href={whatsAppLink()} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">
                  {t('footer.whatsapp')} (UAE): {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="flex gap-3"><MailIcon className="h-5 w-5 text-gold shrink-0" /> {CONTACT_EMAIL}</li>
              <li className="flex gap-3">
                <GlobeIcon className="h-5 w-5 text-gold shrink-0" />
                <a href={WEBSITE_URL} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">{WEBSITE_DISPLAY}</a>
              </li>
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