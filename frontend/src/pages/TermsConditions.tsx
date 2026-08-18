import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageBanner } from '../components/layout/PageBanner';

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

// Section ids are stable DOM anchors (not displayed), independent of language.
const SECTION_IDS = [
  'bookingPolicy', 'paymentPolicy', 'cancellationPolicy', 'refundPolicy', 'travelInsurance',
  'passportVisa', 'customerResponsibilities', 'companyResponsibilities', 'privacyStatement',
  'liabilityDisclaimer', 'forceMajeure', 'tourChanges', 'childPolicy', 'hotelPolicy',
  'transportationPolicy', 'contactInformation',
] as const;

export function TermsConditions() {
  const { t } = useTranslation('terms');
  const { t: tc } = useTranslation('common');
  const [active, setActive] = useState<string>(SECTION_IDS[0]);

  const SECTIONS: Section[] = SECTION_IDS.map((id) => {
    if (id === 'cancellationPolicy') {
      return {
        id,
        title: t('sections.cancellationPolicy.title'),
        body: (
          <div className="space-y-2">
            <p>{t('sections.cancellationPolicy.intro')}</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>{t('sections.cancellationPolicy.bullet1')}</li>
              <li>{t('sections.cancellationPolicy.bullet2')}</li>
              <li>{t('sections.cancellationPolicy.bullet3')}</li>
            </ul>
          </div>
        ),
      };
    }
    if (id === 'contactInformation') {
      return {
        id,
        title: t('sections.contactInformation.title'),
        body: (
          <p>
            {t('sections.contactInformation.bodyBefore')}
            <a href="/contact" className="text-emerald underline">{t('sections.contactInformation.contactLink')}</a>
            {t('sections.contactInformation.bodyAfter')}
          </p>
        ),
      };
    }
    return {
      id,
      title: t(`sections.${id}.title`),
      body: <p>{t(`sections.${id}.body`)}</p>,
    };
  });

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow={t('eyebrow')}
        title={t('pageTitle')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tc('nav.home'), href: '/' }, { label: t('pageTitle') }]} />


      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 space-y-1 rounded-2xl bg-white p-4 shadow-soft">
            {SECTIONS.map((s) =>
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`block w-full rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${active === s.id ? 'bg-emerald/10 font-semibold text-emerald' : 'text-forest/60 hover:bg-cream'}`}>

                {s.title}
              </button>
            )}
          </nav>
        </aside>

        <div className="space-y-10 rounded-3xl bg-white p-6 shadow-soft sm:p-10">
          <p className="text-sm text-forest/50">{t('lastUpdated')}</p>
          {SECTIONS.map((s, i) =>
          <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-forest/10 pt-8 first:border-0 first:pt-0">
              <h2 className="font-display text-xl font-semibold text-forest">{i + 1}. {s.title}</h2>
              <div className="mt-3 text-sm leading-relaxed text-forest/70">{s.body}</div>
            </section>
          )}
        </div>
      </section>
    </main>);

}
