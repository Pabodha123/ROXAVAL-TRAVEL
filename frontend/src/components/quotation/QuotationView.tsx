import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ArrowRightIcon, BedDoubleIcon, CalendarIcon, CarIcon, Loader2Icon, MapPinIcon, PlaneIcon, PrinterIcon, StarIcon, UsersIcon } from 'lucide-react';
import { WHATSAPP_DISPLAY_SL, CONTACT_EMAIL, WEBSITE_DISPLAY } from '../../lib/contact';
import { apiGetOne } from '../../lib/api';
import { getCurrentLanguage, SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '../../i18n';
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
  sightseeingIncluded?: boolean;
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

// This page has no navbar, so it doesn't inherit the site-wide language
// switcher. It picks up the site's current language as a starting point
// but then owns its own language independently -- an admin previewing a
// quotation, or a customer opening a shared link, can flip it here without
// touching the rest of the site's language.
export function QuotationView({ endpoint, backHref }: { endpoint: string; backHref?: string }) {
  const { t } = useTranslation('quotation');
  const [docLang, setDocLang] = useState<SupportedLanguageCode>(getCurrentLanguage());
  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetOne<QuotationRequest>(endpoint, { lang: docLang }).
      then((r) => { if (!cancelled) setRequest(r); }).
      finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [endpoint, docLang]);

  if (loading && !request) {
    return <div className="grid min-h-screen place-items-center bg-cream"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;
  }
  if (!request?.itinerary) {
    return <div className="grid min-h-screen place-items-center bg-cream text-sm text-forest/50">{t('notReady')}</div>;
  }

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
              <ArrowLeftIcon className="h-3.5 w-3.5" /> {t('back')}
            </Link>
          }
          <p className="text-sm font-semibold text-white">{t('documentTitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
            {SUPPORTED_LANGUAGES.map((l) =>
              <button
                key={l.code}
                type="button"
                onClick={() => setDocLang(l.code)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${docLang === l.code ? 'bg-gold text-forest' : 'text-white/70 hover:text-white'}`}
              >
                {l.code.toUpperCase()}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-forest hover:scale-105 transition-transform"
          >
            <PrinterIcon className="h-3.5 w-3.5" /> {t('print')}
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-forest/15 bg-white px-6 py-10 shadow-soft print:mt-0 print:rounded-none print:shadow-none sm:px-10">
        <img
          src="/quotation-banner.png"
          alt="Roxaval Travels"
          className="-mx-6 -mt-10 mb-8 h-auto w-[calc(100%+3rem)] max-w-none rounded-t-2xl object-cover print:mb-4 print:rounded-none sm:-mx-10 sm:w-[calc(100%+5rem)]" />

        {/* Header */}
        <div className="border-b border-forest/10 pb-6 print:pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-semibold text-forest sm:text-3xl">{itin.title || t('defaultTitle', { days: days.length })}</p>
              <p className="mt-1 text-sm text-forest/50">{t('quotationNo', { ref: request.referenceNumber })}</p>
            </div>
            <div className="rounded-2xl bg-forest px-5 py-3 text-right text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{t('totalCost')}</p>
              <p className="font-display text-xl font-bold">{itin.pricing.currency} {itin.pricing.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest/70">
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-emerald" /> {t('duration', { nights, days: days.length })}</span>
            <span className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-emerald" /> {request.travelers.adults} {t('adults')}{request.travelers.children ? `, ${request.travelers.children} ${t('children')}` : ''}{request.travelers.infants ? `, ${request.travelers.infants} ${t('infants')}` : ''}</span>
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

        <RouteMap days={days} lang={docLang} />

        {/* Day by day */}
        <div className="mt-8 space-y-8 print:space-y-5">
          {days.map((d) => {
            const activities = (d.activityPricing || []).filter((a) => a.selected !== false && a.activity);
            const transfers = (d.transfers || []).filter((t) => t.selected !== false && t.transfer);
            const flights = (d.flights || []).filter((f) => f.selected !== false);
            const roomType = d.hotel?.roomTypes?.find((rt) => rt.name === d.roomType);

            return (
              <div key={d.dayNumber}>
                <div className="flex items-center gap-3 print:break-inside-avoid">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-sm font-bold text-white">{d.dayNumber}</div>
                  <div>
                    <p className="font-display text-base font-semibold text-forest">{t('day')} {d.dayNumber}{d.destinations?.[0]?.name ? ` - ${d.destinations[0].name}` : ''}</p>
                    {d.date && <p className="text-xs text-forest/50">{fmtDate(d.date)}</p>}
                  </div>
                </div>

                <div className="mt-3 space-y-3 pl-12">
                  {activities.map((a, i) =>
                    <div key={i} className="flex gap-3 rounded-xl border border-forest/10 p-3 print:break-inside-avoid">
                      {a.activity?.image && <img src={a.activity.image} alt={a.activity.name} className="h-20 w-28 shrink-0 rounded-lg object-cover" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-forest">{a.activity?.name}</p>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald">{a.activity?.category || t('sightseeing')}</p>
                        <p className="mt-0.5 text-xs text-forest/50">{t('forTravelers')} {a.adultCount} {t('adults')}{a.childCount ? `, ${a.childCount} ${t('children')}` : ''}{a.infantCount ? `, ${a.infantCount} ${t('infants')}` : ''}</p>
                        {a.activity?.description && <p className="mt-1 text-xs leading-relaxed text-forest/60 line-clamp-3">{a.activity.description}</p>}
                      </div>
                    </div>
                  )}

                  {transfers.map((tr, i) =>
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-forest/10 p-3 print:break-inside-avoid">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-forest"><CarIcon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-semibold text-forest">{tr.transfer?.name}</p>
                        <p className="text-xs text-forest/50">{tr.transfer?.type || t('private')} · {tr.transfer?.vehicle?.name || t('vehicle')} × {tr.vehicleCount}</p>
                      </div>
                    </div>
                  )}

                  {flights.map((f, i) =>
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-forest/10 p-3 print:break-inside-avoid">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-forest"><PlaneIcon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-semibold text-forest">{f.airline} {f.flightNumber}</p>
                        <p className="text-xs text-forest/50">{f.from} → {f.to}{f.departureTime ? ` · ${f.departureTime}` : ''}</p>
                      </div>
                    </div>
                  )}

                  {d.hotel &&
                    <div className="flex gap-3 rounded-xl border border-emerald/20 bg-emerald/5 p-3 print:break-inside-avoid">
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
                          {t('checkIn')} {fmtDate(d.date)} · {t('checkOut')} {nextDate(d.date)}
                          {d.roomType && <> · {t('room')}: {d.roomType}</>}
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
          <p className="font-display text-lg font-semibold text-forest">{t('financialSummary')} <span className="text-sm font-normal text-forest/50">[ in {itin.pricing.currency} ]</span></p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-forest/10 text-forest/50">
                  <th className="py-2 pr-3 font-semibold">{t('tableHotel')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('tableDestination')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('tableRoomType')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('tableMealPlan')}</th>
                  <th className="py-2 pr-3 font-semibold">{t('tableRooms')}</th>
                  <th className="py-2 font-semibold">{t('tableStay')}</th>
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
              <p className="text-xs text-forest/50">{t('basePrice')}: {itin.pricing.currency} {itin.pricing.basePrice.toLocaleString()} &nbsp; {t('discount')}: {itin.pricing.currency} {itin.pricing.discount.toLocaleString()}</p>
            }
            <p className="font-display text-xl font-bold text-forest">
              {t('total')}: {itin.pricing.currency} {itin.pricing.totalPrice.toLocaleString()}
            </p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${itin.sightseeingIncluded === false ? 'bg-gold/15 text-forest/70' : 'bg-emerald/10 text-emerald'}`}>
              {itin.sightseeingIncluded === false ? t('sightseeingNotIncluded') : t('sightseeingIncluded')}
            </span>
          </div>
        </div>

        {/* Inclusions / Exclusions */}
        <div className="mt-10 grid gap-8 border-t border-forest/10 pt-6 print:mt-6 print:break-inside-avoid sm:grid-cols-2">
          <div>
            <p className="font-display text-sm font-semibold text-emerald">✅ {t('inclusions')}</p>
            <div className="mt-3"><NotesBlock text={itin.inclusions} /></div>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-red-600">❌ {t('exclusions')}</p>
            <div className="mt-3"><NotesBlock text={itin.exclusions} /></div>
          </div>
        </div>

        {(itin.visaRequirements || itin.travelInsurance) &&
          <div className="mt-8 grid gap-8 border-t border-forest/10 pt-6 print:mt-5 print:break-inside-avoid sm:grid-cols-2">
            {itin.visaRequirements &&
              <div>
                <p className="font-display text-sm font-semibold text-forest">{t('visaRequirements')}</p>
                <p className="mt-2 text-xs leading-relaxed text-forest/60">{itin.visaRequirements}</p>
              </div>
            }
            {itin.travelInsurance &&
              <div>
                <p className="font-display text-sm font-semibold text-forest">{t('travelInsurance')}</p>
                <p className="mt-2 text-xs leading-relaxed text-forest/60">{itin.travelInsurance}</p>
              </div>
            }
          </div>
        }

        {itin.cancellationPolicy &&
          <div className="mt-8 border-t border-forest/10 pt-6 print:mt-5 print:break-inside-avoid">
            <p className="font-display text-sm font-semibold text-forest">💸 {t('cancellationPolicy')}</p>
            <div className="mt-3"><NotesBlock text={itin.cancellationPolicy} /></div>
          </div>
        }

        {itin.customerFacingNotes &&
          <div className="mt-8 border-t border-forest/10 pt-6 print:mt-5 print:break-inside-avoid">
            <p className="font-display text-sm font-semibold text-forest">📌 {t('importantNotes')}</p>
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
