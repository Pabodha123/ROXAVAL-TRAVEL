import React, { useState } from 'react';
import { PageBanner } from '../components/layout/PageBanner';

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
{
  id: 'booking-policy',
  title: 'Booking Policy',
  body: <p>All bookings are subject to availability and are only confirmed once the required advance payment has been received and acknowledged by Roxaval Travels. A booking reference and confirmation will be issued for every confirmed reservation.</p>
},
{
  id: 'payment-policy',
  title: 'Payment Policy',
  body: <p>A non-refundable advance payment (typically 30% of the total tour cost) is required to confirm a booking, with the remaining balance due before the tour start date as specified at the time of booking. Accepted payment methods are online bank transfer (verified against an uploaded receipt) and WhatsApp-coordinated payment.</p>
},
{
  id: 'cancellation-policy',
  title: 'Cancellation Policy',
  body:
  <div className="space-y-2">
      <p>Cancellations must be submitted in writing (email or WhatsApp). Cancellation charges are applied as a percentage of the total tour cost based on how far in advance notice is given:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>30+ days before departure: advance payment forfeited only</li>
        <li>15–29 days before departure: 50% of total tour cost</li>
        <li>0–14 days before departure: 100% of total tour cost</li>
      </ul>
    </div>

},
{
  id: 'refund-policy',
  title: 'Refund Policy',
  body: <p>Eligible refunds (per the Cancellation Policy above) are processed to the original payment method within 14 business days. Refunds for unused services during an active tour are considered on a case-by-case basis and are not guaranteed.</p>
},
{
  id: 'travel-insurance',
  title: 'Travel Insurance',
  body: <p>Roxaval Travels strongly recommends all travelers obtain comprehensive travel insurance covering medical emergencies, trip cancellation, lost baggage and personal liability before departure. Travel insurance is not included in any package or custom itinerary unless explicitly stated.</p>
},
{
  id: 'passport-visa',
  title: 'Passport & Visa Requirements',
  body: <p>It is the traveler's sole responsibility to hold a passport valid for at least six months beyond the intended stay and to obtain any required visa (including Sri Lanka's ETA where applicable) before arrival. Roxaval Travels can advise on requirements but accepts no liability for denied entry due to inadequate documentation.</p>
},
{
  id: 'customer-responsibilities',
  title: 'Customer Responsibilities',
  body: <p>Travelers are expected to provide accurate personal and health information, arrive punctually for scheduled activities and transfers, respect local laws and customs, and behave in a manner that does not endanger themselves, other travelers, guides or the environment.</p>
},
{
  id: 'company-responsibilities',
  title: 'Company Responsibilities',
  body: <p>Roxaval Travels commits to arranging all confirmed services (accommodation, transport, guiding and activities) as described in the itinerary, using licensed and vetted local partners, and providing timely support throughout the traveler's journey.</p>
},
{
  id: 'privacy-statement',
  title: 'Privacy Statement',
  body: <p>Personal information collected during booking (name, contact details, payment information) is used solely to arrange and manage your travel services and is never sold to third parties. Data is stored securely and shared only with partners directly involved in delivering your booked services (e.g. hotels, transport providers).</p>
},
{
  id: 'liability-disclaimer',
  title: 'Liability Disclaimer',
  body: <p>Roxaval Travels acts as an agent coordinating third-party service providers (hotels, transport operators, activity operators) and is not liable for their acts, omissions, delays or failures beyond its reasonable control. Travelers participate in all activities at their own risk.</p>
},
{
  id: 'force-majeure',
  title: 'Force Majeure',
  body: <p>Roxaval Travels is not liable for any failure to perform its obligations where such failure results from circumstances beyond its reasonable control, including natural disasters, extreme weather, civil unrest, government restrictions, pandemics or transportation strikes. In such cases, we will make reasonable efforts to offer alternative arrangements.</p>
},
{
  id: 'tour-changes',
  title: 'Tour Changes',
  body: <p>Itinerary details (routes, timings, accommodation) may occasionally need to change due to weather, safety, local conditions or operational requirements. Roxaval Travels will always aim to provide a comparable alternative and will notify travelers of significant changes as soon as reasonably possible.</p>
},
{
  id: 'child-policy',
  title: 'Child Policy',
  body: <p>Children are welcome on most tours. Pricing for children typically applies to guests aged 2–11 sharing a room with a paying adult, at a reduced rate reflected in the itinerary quote. Infants under 2 usually travel free of charge where no extra bed or seat is required. Specific age policies vary by hotel and activity and will be confirmed during itinerary planning.</p>
},
{
  id: 'hotel-policy',
  title: 'Hotel Policy',
  body: <p>Standard hotel check-in is from 2:00 PM and check-out by 11:00 AM unless otherwise arranged. Room types and meal plans are as confirmed in your itinerary; early check-in or late check-out is subject to availability and may incur additional charges payable directly to the hotel.</p>
},
{
  id: 'transportation-policy',
  title: 'Transportation Policy',
  body: <p>All ground transportation is provided using modern, air-conditioned vehicles operated by licensed, experienced drivers. Vehicle types are selected based on group size and itinerary requirements. Travelers are expected to follow driver/guide safety instructions at all times.</p>
},
{
  id: 'contact-information',
  title: 'Contact Information',
  body: <p>For any questions regarding these Terms & Conditions, please reach out via our <a href="/contact" className="text-emerald underline">Contact Us</a> page, email us at info@roxavaltravels.com, or call +94 77 880 3522.</p>
}];


export function TermsConditions() {
  const [active, setActive] = useState(SECTIONS[0].id);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow="Please Read Carefully"
        title="Terms & Conditions"
        subtitle="The policies that govern every booking made with Roxaval Travels."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms & Conditions' }]} />


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
          <p className="text-sm text-forest/50">Last updated: January 2026. By booking a tour with Roxaval Travels, you agree to the terms outlined below.</p>
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
