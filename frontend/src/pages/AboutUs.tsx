import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, StarIcon, MessageCircleIcon, MapIcon, ShieldCheckIcon, AwardIcon } from 'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Stats } from '../components/sections/Stats';
import { WhyChoose } from '../components/sections/WhyChoose';
import { CoreValues } from '../components/sections/CoreValues';
import { HotelPartners } from '../components/sections/HotelPartners';
import { apiGetList } from '../lib/api';
import type { Review } from '../types/review';

const CREDENTIALS = [
{ icon: ShieldCheckIcon, label: 'SLTDA Licensed', desc: 'Officially registered and activated with the Sri Lanka Tourism Development Authority.' },
{ icon: StarIcon, label: 'TripAdvisor Member', desc: 'Listed and reviewed by real travelers on TripAdvisor.' },
{ icon: AwardIcon, label: 'SLITO Member', desc: 'Proud member of the Sri Lanka Inbound Tour Operators association.' }];


export function AboutUs() {
  const [testimonials, setTestimonials] = useState<Review[]>([]);

  useEffect(() => {
    apiGetList<Review>('/reviews', { limit: 3, sort: '-createdAt' }).
    then(({ data }) => setTestimonials(data)).
    catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow="Our Story"
        title="About Roxaval Travels"
        subtitle="Let your journey smile."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />


      {/* Company Introduction */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
          <SectionHeading eyebrow="Who we are" title="Your Trusted Local Travel Partner" align="left" />
          <p className="mt-6 text-base leading-relaxed text-forest/70">
            Roxaval Travels is a Sri Lanka-based travel agency dedicated to crafting luxurious, fully customized journeys across
            the island - from ancient kingdoms to golden beaches. We believe travel should feel personal, so every itinerary we
            build is designed around you: your pace, your interests and your budget.
          </p>
          <p className="mt-4 text-base leading-relaxed text-forest/70">
            From the moment you reach out to the moment you land back home, our local experts handle every hotel, guide,
            vehicle and detail - so all you have to do is show up and explore.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }} className="overflow-hidden rounded-[2rem] shadow-lift">
          <img src="/f1dc4405-8788-4026-86f6-8dcd6433d54c.jpg" alt="Sri Lanka landscape" className="h-full w-full object-cover" />
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }} className="order-2 overflow-hidden rounded-[2rem] shadow-lift lg:order-1">
            <img src="/e12be888-4561-43cf-b8a3-fb6d9de4b630.jpg" alt="Roxaval Travels journey" className="h-full w-full object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }} className="order-1 lg:order-2">
            <SectionHeading eyebrow="Our Story" title="Built on a Love for This Island" align="left" />
            <p className="mt-6 text-base leading-relaxed text-forest/70">
              Roxaval Travels began with a simple idea - that visitors deserve to experience Sri Lanka the way locals do,
              not through a rigid, one-size-fits-all package. Over more than a decade, that idea grew into a full-service
              travel agency built around custom itineraries, trusted local guides and genuine care for every traveler.
            </p>
            <p className="mt-4 text-base leading-relaxed text-forest/70">
              Today, thousands of travelers have explored the island with us - from the ancient cities of the Cultural
              Triangle to the misty tea trails of the hill country and the sun-soaked shores of the south coast.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="What Drives Us" title="Mission & Vision" subtitle="The principles behind every itinerary we design." />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="rounded-3xl bg-forest p-8 text-white shadow-lift sm:p-10">
            <MapIcon className="h-8 w-8 text-gold" />
            <h3 className="font-display mt-5 text-2xl font-semibold">Our Mission</h3>
            <p className="mt-3 leading-relaxed text-cream/80">
              To make travelling in Sri Lanka simple, personal, and memorable through trusted service and authentic
              local experiences.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-3xl bg-emerald p-8 text-white shadow-lift sm:p-10">
            <StarIcon className="h-8 w-8 text-gold" />
            <h3 className="font-display mt-5 text-2xl font-semibold">Our Vision</h3>
            <p className="mt-3 leading-relaxed text-cream/80">
              To become one of Sri Lanka's most trusted travel brands, creating unforgettable experiences while making
              a positive difference to local communities and the environment.
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
          <SectionHeading eyebrow="Trust & Recognition" title="Licensed, Verified, Trusted" subtitle="Our credentials as a registered Sri Lankan travel operator." />
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
          <SectionHeading eyebrow="Kind Words" title="What Our Travelers Say" />
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
                <p className="mt-4 text-sm font-semibold text-forest">{r.customer?.user?.fullName || 'Verified Traveler'}</p>
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
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to Start Planning?</h2>
          <p className="mt-4 text-cream/80">Let's design a Sri Lankan journey that's entirely yours.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/packages#custom-tour" className="flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 font-semibold text-forest shadow-soft transition-transform hover:scale-105">
              <SparklesIcon className="h-4 w-4" /> Plan My Tour
            </Link>
            <Link to="/contact" className="flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10">
              <MessageCircleIcon className="h-4 w-4" /> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>);

}
