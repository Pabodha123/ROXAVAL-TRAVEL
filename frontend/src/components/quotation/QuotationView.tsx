import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, BedDoubleIcon, CalendarIcon, CarIcon, MapPinIcon, PlaneIcon, PrinterIcon, StarIcon, UsersIcon } from 'lucide-react';
import { WHATSAPP_DISPLAY_SL, CONTACT_EMAIL, WEBSITE_DISPLAY } from '../../lib/contact';
import { NotesBlock } from './NotesBlock';
import { RouteMap } from './RouteMap';

interface RefName {
  _id: string;
  name: string;
  mapLocation?: { lat?: number; lng?: number };
}

interface HotelRef {
  _id: string;
  name: string;
  category?: string;
  starRating?: number;
  images?: string[];
  address?: string;
  description?: string;
  destination?: RefName;
  roomTypes?: { name: string; mealPlan?: string }[];
}

interface ActivityRef {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  category?: string;
}

interface TransferRef {
  _id: string;
  name: string;
  type?: string;
  supplier?: string;
  transferFor?: string;
  vehicle?: { name: string; type?: string };
}

interface RoomOccupancy {
  single: number;
  double: number;
  triple: number;
  quad: number;
  extraBed: number;
  childWithBed: number;
  childNoBed: number;
  infant: number;
}

export interface QuotationDay {
  dayNumber: number;
  date?: string;
  title: string;
  schedule?: string;
  destinations?: RefName[];
  hotel?: HotelRef;
  roomType?: string;
  numberOfRooms?: number;
  roomOccupancy?: RoomOccupancy;
  activityPricing?: { activity?: ActivityRef; adultCount: number; childCount: number; infantCount: number; selected?: boolean }[];
  transfers?: { transfer?: TransferRef; vehicleCount: number; selected?: boolean }[];
  flights?: { airline?: string; flightNumber?: string; from?: string; to?: string; departureTime?: string; arrivalTime?: string; selected?: boolean }[];
}

export interface QuotationItinerary {
  title: string;
  summary?: string;
  days: QuotationDay[];
  pricing: { basePrice: number; discount: number; totalPrice: number; currency: string; pricePerPerson: boolean };
  visaRequirements?: string;
  travelInsurance?: string;
  cancellationPolicy?: string;
  inclusions?: string;
  exclusions?: string;
  customerFacingNotes?: string;
}

export interface QuotationRequest {
  referenceNumber: string;
  travelDates: { startDate: string; endDate: string };
  travelers: { adults: number; children: number; infants: number };
  itinerary: QuotationItinerary;
}

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const occupancyLabel = (o?: RoomOccupancy) => {
  if (!o) return '';
  const map: [keyof RoomOccupancy, string][] = [['single', 'SGL'], ['double', 'DBL'], ['triple', 'TRPL'], ['quad', 'QUAD'], ['extraBed', 'Extra Bed']];
  return map.filter(([k]) => o[k] > 0).map(([k, label]) => `${label}: ${o[k]}`).join(', ') || '-';
};

const nextDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  d.setDate(d.getDate() + 1);
  return fmtDate(d.toISOString());
};

export function QuotationView({ request, backHref }: { request: QuotationRequest; backHref?: string }) {
  const itin = request.itinerary;
  const days = itin.days || [];
  const nights = Math.max(0, days.length - 1);

  // Ordered, de-duplicated route (consecutive repeats collapsed) built from
  // each day's destination tags — falls back to hotel destinations when a
  // day has no explicit destination set.
  const route: string[] = [];
  days.forEach((d) => {
    const name = d.destinations?.[0]?.name || d.hotel?.destination?.name;
    if (name && route[route.length - 1] !== name) route.push(name);
  });

  return (
    <div className="min-h-screen bg-cream/40 pb-20 print:min-h-0 print:pb-0">
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between bg-forest px-4 py-3 sm:px-8">
        <div className="flex items-center gap-4">
          {backHref &&
            <Link to={backHref} className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white">
              <ArrowLeftIcon className="h-3.5 w-3.5" /> Back
            </Link>
          }
          <p className="text-sm font-semibold text-white">Quotation Preview</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-forest hover:scale-105 transition-transform"
        >
          <PrinterIcon className="h-3.5 w-3.5" /> Print / Save as PDF
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-forest/15 bg-white px-6 py-10 shadow-soft print:mt-0 print:rounded-none print:shadow-none sm:px-10">
        <img
          src="/quotation-banner.png"
          alt="Roxaval Travels"
          className="-mx-6 -mt-10 mb-8 w-[calc(100%+3rem)] max-w-none rounded-t-2xl object-cover print:rounded-none sm:-mx-10 sm:w-[calc(100%+5rem)]" />

        {/* Header */}
        <div className="border-b border-forest/10 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-semibold text-forest sm:text-3xl">{itin.title || `${days.length} Days Sri Lankan Tour`}</p>
              <p className="mt-1 text-sm text-forest/50">Quotation No. {request.referenceNumber}</p>
            </div>
            <div className="rounded-2xl bg-forest px-5 py-3 text-right text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{itin.pricing.pricePerPerson ? 'Per Person' : 'Total Package'}</p>
              <p className="font-display text-xl font-bold">{itin.pricing.currency} {itin.pricing.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest/70">
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-emerald" /> {nights} Nights / {days.length} Days</span>
            <span className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-emerald" /> {request.travelers.adults} Adults{request.travelers.children ? `, ${request.travelers.children} Children` : ''}{request.travelers.infants ? `, ${request.travelers.infants} Infants` : ''}</span>
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-emerald" /> {fmtDate(request.travelDates.startDate)} – {fmtDate(request.travelDates.endDate)}</span>
          </div>

          {route.length > 0 &&
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-forest">
              {route.map((r, i) =>
                <React.Fragment key={i}>
                  {i > 0 && <ArrowRightIcon className="h-3.5 w-3.5 text-forest/30" />}
                  <span className="flex items-center gap-1"><MapPinIcon className="h-3.5 w-3.5 text-emerald" /> {r}</span>
                </React.Fragment>
              )}
            </div>
          }
        </div>

        <RouteMap days={days} />

        {/* Day by day */}
        <div className="mt-8 space-y-8 print:space-y-5">
          {days.map((d) => {
            const activities = (d.activityPricing || []).filter((a) => a.selected !== false && a.activity);
            const transfers = (d.transfers || []).filter((t) => t.selected !== false && t.transfer);
            const flights = (d.flights || []).filter((f) => f.selected !== false);
            const roomType = d.hotel?.roomTypes?.find((rt) => rt.name === d.roomType);

            return (
              <div key={d.dayNumber} className="break-inside-avoid">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-sm font-bold text-white">{d.dayNumber}</div>
                  <div>
                    <p className="font-display text-base font-semibold text-forest">Day {d.dayNumber}{d.destinations?.[0]?.name ? ` — ${d.destinations[0].name}` : ''}</p>
                    {d.date && <p className="text-xs text-forest/50">{fmtDate(d.date)}</p>}
                  </div>
                </div>

                <div className="mt-3 space-y-3 pl-12">
                  {activities.map((a, i) =>
                    <div key={i} className="flex gap-3 rounded-xl border border-forest/10 p-3">
                      {a.activity?.image && <img src={a.activity.image} alt={a.activity.name} className="h-20 w-28 shrink-0 rounded-lg object-cover" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-forest">{a.activity?.name}</p>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald">{a.activity?.category || 'Sightseeing'}</p>
                        <p className="mt-0.5 text-xs text-forest/50">For {a.adultCount} Adults{a.childCount ? `, ${a.childCount} Children` : ''}{a.infantCount ? `, ${a.infantCount} Infants` : ''}</p>
                        {a.activity?.description && <p className="mt-1 text-xs leading-relaxed text-forest/60 line-clamp-3">{a.activity.description}</p>}
                      </div>
                    </div>
                  )}

                  {transfers.map((t, i) =>
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-forest/10 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-forest"><CarIcon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-semibold text-forest">{t.transfer?.name}</p>
                        <p className="text-xs text-forest/50">{t.transfer?.type || 'Private'} · {t.transfer?.vehicle?.name || 'Vehicle'} × {t.vehicleCount}</p>
                      </div>
                    </div>
                  )}

                  {flights.map((f, i) =>
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-forest/10 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-forest"><PlaneIcon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-semibold text-forest">{f.airline} {f.flightNumber}</p>
                        <p className="text-xs text-forest/50">{f.from} → {f.to}{f.departureTime ? ` · ${f.departureTime}` : ''}</p>
                      </div>
                    </div>
                  )}

                  {d.hotel &&
                    <div className="flex gap-3 rounded-xl border border-emerald/20 bg-emerald/5 p-3">
                      {d.hotel.images?.[0] && <img src={d.hotel.images[0]} alt={d.hotel.name} className="h-24 w-32 shrink-0 rounded-lg object-cover" />}
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-forest">
                          <BedDoubleIcon className="h-3.5 w-3.5 text-emerald" /> {d.hotel.name}
                          {Boolean(d.hotel.starRating) &&
                            <span className="flex items-center text-gold">{Array.from({ length: d.hotel.starRating || 0 }).map((_, s) => <StarIcon key={s} className="h-3 w-3 fill-gold" />)}</span>
                          }
                        </p>
                        <p className="text-xs text-forest/50">{d.hotel.destination?.name}{d.hotel.address ? ` · ${d.hotel.address}` : ''}</p>
                        <p className="mt-1 text-xs text-forest/70">
                          Check-in {fmtDate(d.date)} · Check-out {nextDate(d.date)}
                          {d.roomType && <> · Room: {d.roomType}</>}
                          {roomType?.mealPlan && <> · {roomType.mealPlan}</>}
                        </p>
                        {d.hotel.description && <p className="mt-1 text-xs leading-relaxed text-forest/60 line-clamp-3">{d.hotel.description}</p>}
                      </div>
                    </div>
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial summary */}
        <div className="mt-10 border-t border-forest/10 pt-6 print:mt-6 print:break-inside-avoid">
          <p className="font-display text-lg font-semibold text-forest">Quotation Financial Summary <span className="text-sm font-normal text-forest/50">[ in {itin.pricing.currency} ]</span></p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-forest/10 text-forest/50">
                  <th className="py-2 pr-3 font-semibold">Hotel</th>
                  <th className="py-2 pr-3 font-semibold">Destination</th>
                  <th className="py-2 pr-3 font-semibold">Room Type</th>
                  <th className="py-2 pr-3 font-semibold">Meal Plan</th>
                  <th className="py-2 pr-3 font-semibold">Rooms</th>
                  <th className="py-2 font-semibold">Stay</th>
                </tr>
              </thead>
              <tbody>
                {days.filter((d) => d.hotel).map((d, i) => {
                  const roomType = d.hotel?.roomTypes?.find((rt) => rt.name === d.roomType);
                  return (
                    <tr key={i} className="border-b border-forest/5">
                      <td className="py-2 pr-3 text-forest">{d.hotel?.name}{d.hotel?.starRating ? ` (${d.hotel.starRating}★)` : ''}</td>
                      <td className="py-2 pr-3 text-forest/70">{d.hotel?.destination?.name}</td>
                      <td className="py-2 pr-3 text-forest/70">{d.roomType || '-'}</td>
                      <td className="py-2 pr-3 text-forest/70">{roomType?.mealPlan || '-'}</td>
                      <td className="py-2 pr-3 text-forest/70">{occupancyLabel(d.roomOccupancy)}</td>
                      <td className="py-2 text-forest/70">{fmtDate(d.date)} → {nextDate(d.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-end gap-1 border-t border-forest/10 pt-4">
            {itin.pricing.discount > 0 &&
              <p className="text-xs text-forest/50">Base Price: {itin.pricing.currency} {itin.pricing.basePrice.toLocaleString()} &nbsp; Discount: {itin.pricing.currency} {itin.pricing.discount.toLocaleString()}</p>
            }
            <p className="font-display text-xl font-bold text-forest">
              Total: {itin.pricing.currency} {itin.pricing.totalPrice.toLocaleString()}{itin.pricing.pricePerPerson ? ' / person' : ''}
            </p>
          </div>
        </div>

        {/* Inclusions / Exclusions */}
        <div className="mt-10 grid gap-8 border-t border-forest/10 pt-6 print:mt-6 print:break-inside-avoid sm:grid-cols-2">
          <div>
            <p className="font-display text-sm font-semibold text-emerald">✅ Inclusions</p>
            <div className="mt-3"><NotesBlock text={itin.inclusions} /></div>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-red-600">❌ Exclusions</p>
            <div className="mt-3"><NotesBlock text={itin.exclusions} /></div>
          </div>
        </div>

        {(itin.visaRequirements || itin.travelInsurance) &&
          <div className="mt-8 grid gap-8 border-t border-forest/10 pt-6 print:mt-5 print:break-inside-avoid sm:grid-cols-2">
            {itin.visaRequirements &&
              <div>
                <p className="font-display text-sm font-semibold text-forest">Visa Requirements</p>
                <p className="mt-2 text-xs leading-relaxed text-forest/60">{itin.visaRequirements}</p>
              </div>
            }
            {itin.travelInsurance &&
              <div>
                <p className="font-display text-sm font-semibold text-forest">Travel Insurance</p>
                <p className="mt-2 text-xs leading-relaxed text-forest/60">{itin.travelInsurance}</p>
              </div>
            }
          </div>
        }

        {itin.cancellationPolicy &&
          <div className="mt-8 border-t border-forest/10 pt-6 print:mt-5 print:break-inside-avoid">
            <p className="font-display text-sm font-semibold text-forest">💸 Cancellation Policy</p>
            <div className="mt-3"><NotesBlock text={itin.cancellationPolicy} /></div>
          </div>
        }

        {itin.customerFacingNotes &&
          <div className="mt-8 border-t border-forest/10 pt-6 print:mt-5 print:break-inside-avoid">
            <p className="font-display text-sm font-semibold text-forest">📌 Important Notes</p>
            <div className="mt-3"><NotesBlock text={itin.customerFacingNotes} /></div>
          </div>
        }

        {/* Footer */}
        <div className="mt-10 border-t border-forest/10 pt-6 text-center text-xs text-forest/50 print:mt-6 print:break-inside-avoid">
          <p className="font-display text-sm font-semibold text-forest">Roxaval Travels</p>
          <p className="mt-1">{WHATSAPP_DISPLAY_SL} &nbsp;|&nbsp; {CONTACT_EMAIL} &nbsp;|&nbsp; {WEBSITE_DISPLAY}</p>
        </div>
      </div>
    </div>
  );
}
