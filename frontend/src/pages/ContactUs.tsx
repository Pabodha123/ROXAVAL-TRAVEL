import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon, PhoneIcon, MailIcon, MessageCircleIcon, ClockIcon,
  FacebookIcon, InstagramIcon, YoutubeIcon, MusicIcon, SendIcon,
  Loader2Icon, CheckIcon, ChevronDownIcon, ShieldAlertIcon } from
'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { SectionHeading } from '../components/ui/SectionHeading';
import { apiGetOne, apiPost, ApiRequestError } from '../lib/api';
import { whatsAppLink, WHATSAPP_NUMBER } from '../lib/contact';

interface Settings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: { facebook: string; instagram: string; tiktok: string; youtube: string; whatsapp: string };
}

const FAQS = [
{ q: 'How quickly will I get a response?', a: 'Our team typically replies within 24 hours, often much sooner during business hours.' },
{ q: 'Can I customize any tour package?', a: 'Absolutely — every package can be tailored, or we can design a fully custom itinerary from scratch via "Plan My Tour".' },
{ q: 'What payment methods do you accept?', a: 'Bank transfer, WhatsApp-coordinated payment, and cash on arrival for select bookings.' },
{ q: 'Do you offer airport pickup?', a: 'Yes, airport transfers can be included in any custom itinerary or package booking.' },
{ q: 'Is travel insurance included?', a: 'Travel insurance is not included by default — see our Terms & Conditions for details and recommendations.' }];


const DEFAULT_SETTINGS: Settings = {
  companyName: 'Roxaval Travels',
  address: 'No 221 Ganemulla Road, Kandana, Sri Lanka',
  phone: '+94 11 234 5678',
  email: 'hello@roxavaltravels.com',
  socialLinks: { facebook: '', instagram: '', tiktok: '', youtube: '', whatsapp: WHATSAPP_NUMBER }
};

const SOCIAL_ICONS: Record<string, React.ComponentType<{className?: string;}>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  tiktok: MusicIcon
};

export function ContactUs() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    apiGetOne<Settings>('/settings').
    then((s) => setSettings({
      companyName: s.companyName || DEFAULT_SETTINGS.companyName,
      address: s.address || DEFAULT_SETTINGS.address,
      phone: s.phone || DEFAULT_SETTINGS.phone,
      email: s.email || DEFAULT_SETTINGS.email,
      socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...s.socialLinks }
    })).
    catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiPost('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow="Get In Touch"
        title="Contact Us"
        subtitle="Questions, custom tour ideas, or just want to say hello — we'd love to hear from you."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]} />


      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="rounded-3xl bg-white p-6 shadow-soft sm:p-10">
          {submitted ?
          <div className="flex flex-col items-center py-10 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald/10 text-emerald">
                <CheckIcon className="h-8 w-8" />
              </div>
              <h3 className="font-display mt-5 text-2xl font-semibold text-forest">Message Sent!</h3>
              <p className="mt-2 max-w-sm text-sm text-forest/60">Thank you for reaching out. Our travel experts will get back to you shortly.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 rounded-full border border-forest/15 px-6 py-2.5 text-sm font-semibold text-forest hover:bg-cream">Send another message</button>
            </div> :

          <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-display text-2xl font-semibold text-forest">Send Us a Message</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest">Phone (optional)</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-forest">Subject</label>
                  <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest">Message</label>
                <textarea required rows={5} minLength={10} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-2xl border border-forest/10 bg-cream/50 p-4 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" placeholder="Tell us how we can help..." />
              </div>
              {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-105 disabled:opacity-70">
                {submitting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                Send Message
              </button>
            </form>
          }
        </motion.div>

        {/* Info */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="rounded-3xl bg-forest p-7 text-white shadow-lift">
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3"><MapPinIcon className="h-5 w-5 shrink-0 text-gold" /> {settings.address}</li>
              <li className="flex gap-3"><PhoneIcon className="h-5 w-5 shrink-0 text-gold" /> {settings.phone}</li>
              <li className="flex gap-3"><MailIcon className="h-5 w-5 shrink-0 text-gold" /> {settings.email}</li>
              <li className="flex gap-3"><ClockIcon className="h-5 w-5 shrink-0 text-gold" /> Mon–Sat: 8:30 AM – 6:30 PM &middot; Sun: By appointment</li>
              <li className="flex gap-3"><ShieldAlertIcon className="h-5 w-5 shrink-0 text-gold" /> Emergency (24/7): {settings.phone}</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsAppLink('Hi Roxaval Travels, I have a question!')} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105">
                <MessageCircleIcon className="h-4 w-4" /> WhatsApp Us
              </a>
              {Object.entries(settings.socialLinks).filter(([k]) => k !== 'whatsapp').map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key];
                if (!Icon) return null;
                return (
                  <a key={key} href={url || '#'} target="_blank" rel="noreferrer" aria-label={key} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-forest transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>);

              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay: 0.1 }} className="overflow-hidden rounded-3xl shadow-soft">
            <iframe
              title="Roxaval Travels location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`}
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" />

          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Quick Answers" title="Frequently Asked Questions" />
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) =>
          <div key={f.q} className="overflow-hidden rounded-2xl bg-white shadow-soft">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left">
                <span className="font-semibold text-forest">{f.q}</span>
                <ChevronDownIcon className={`h-4 w-4 shrink-0 text-forest/50 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <p className="px-6 pb-4 text-sm leading-relaxed text-forest/65">{f.a}</p>}
            </div>
          )}
        </div>
      </section>
    </main>);

}
