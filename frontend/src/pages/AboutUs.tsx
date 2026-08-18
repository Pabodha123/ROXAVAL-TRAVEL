import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SparklesIcon, StarIcon, MessageCircleIcon, MapIcon, ShieldCheckIcon, AwardIcon } from 'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Stats } from '../components/sections/Stats';
import { WhyChoose } from '../components/sections/WhyChoose';
import { CoreValues } from '../components/sections/CoreValues';
import { HotelPartners } from '../components/sections/HotelPartners';
import { apiGetList } from '../lib/api';
import type { Review } from '../types/review';

export function AboutUs() {
  const { t } = useTranslation('about');
  const { t: tc } = useTranslation('common');
  const CREDENTIALS = [
    { icon: ShieldCheckIcon, label: t('credential1Label'), desc: t('credential1Desc') },
    { icon: StarIcon, label: t('credential2Label'), desc: t('credential2Desc') },
    { icon: AwardIcon, label: t('credential3Label'), desc: t('credential3Desc') },
  ];
  const [testimonials, setTestimonials] = useState<Review[]>([]);

  useEffect(() => {
    apiGetList<Review>('/reviews', { limit: 3, sort: '-createdAt' }).
    then(({ data }) => setTestimonials(data)).
    catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tc('nav.home'), href: '/' }, { label: t('breadcrumb') }]} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto -mt-4 flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">

        <div className="rounded-[2rem] bg-white p-6 shadow-lift">
          <img src="/roxaval-logo-dark.png" alt="Roxaval Travels" className="h-28 w-auto sm:h-36" />
        </div>
      </motion.div>

      {/* Company Introduction */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
          <SectionHeading eyebrow={t('whoWeAreEyebrow')} title={t('whoWeAreTitle')} />
          <p className="mt-6 text-base leading-relaxed text-forest/70">
            {t('intro1')}
          </p>
          <p className="mt-4 text-base leading-relaxed text-forest/70">
            {t('intro2')}
          </p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
            <SectionHeading eyebrow={t('eyebrow')} title={t('storyTitle')} />
            <p className="mt-6 text-base leading-relaxed text-forest/70">
              {t('story1')}
            </p>
            <p className="mt-4 text-base leading-relaxed text-forest/70">
              {t('story2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Client Welcome */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t('realTravelersEyebrow')} title={t('welcomeTitle')} subtitle={t('welcomeSubtitle')} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mt-14 overflow-hidden rounded-[2rem] shadow-lift">

          <img src="/client-welcome-1.jpg" alt="Roxaval Travels guests welcomed to Sri Lanka" className="h-full w-full object-cover" />
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t('whatDrivesUsEyebrow')} title={t('missionVisionTitle')} subtitle={t('missionVisionSubtitle')} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="rounded-3xl bg-forest p-8 text-white shadow-lift sm:p-10">
            <MapIcon className="h-8 w-8 text-gold" />
            <h3 className="font-display mt-5 text-2xl font-semibold">{t('missionTitle')}</h3>
            <p className="mt-3 leading-relaxed text-cream/80">
              {t('missionText')}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-3xl bg-emerald p-8 text-white shadow-lift sm:p-10">
            <StarIcon className="h-8 w-8 text-gold" />
            <h3 className="font-display mt-5 text-2xl font-semibold">{t('visionTitle')}</h3>
            <p className="mt-3 leading-relaxed text-cream/80">
              {t('visionText')}
            </p>
          </motion.div>
        </div>
      </section>

      <CoreValues />

      <HotelPartners />

      {/* Years of Experience / Company Statistics */}
      <Stats />

      {/* Why Choose Roxaval Travels */}
      <WhyChoose />

      {/* Credentials & Memberships */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={t('trustEyebrow')} title={t('credentialsTitle')} subtitle={t('credentialsSubtitle')} />
          <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
            {CREDENTIALS.map((c, i) =>
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl bg-cream p-7 text-center shadow-soft">

                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-white">
                  <c.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-forest">{c.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest/60">{c.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      {testimonials.length > 0 &&
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={t('kindWordsEyebrow')} title={t('testimonialsTitle')} />
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {testimonials.map((r, i) =>
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-3xl bg-white p-7 shadow-soft">

                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, s) => <StarIcon key={s} className={`h-4 w-4 ${s < r.rating ? 'fill-gold' : 'fill-none text-forest/20'}`} />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-forest/70">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-forest">{r.customer?.user?.fullName || r.reviewerName || t('verifiedTraveler')}</p>
                {r.country && <p className="text-xs text-forest/50">{r.country}</p>}
              </motion.div>
          )}
          </div>
        </section>
      }

      {/* CTA */}
      <section className="relative overflow-hidden bg-forest py-20 text-center text-white">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-2xl px-4">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t('ctaTitle')}</h2>
          <p className="mt-4 text-cream/80">{t('ctaSubtitle')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/packages#custom-tour" className="flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 font-semibold text-forest shadow-soft transition-transform hover:scale-105">
              <SparklesIcon className="h-4 w-4" /> {t('planMyTour')}
            </Link>
            <Link to="/contact" className="flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10">
              <MessageCircleIcon className="h-4 w-4" /> {tc('nav.contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </main>);

}
