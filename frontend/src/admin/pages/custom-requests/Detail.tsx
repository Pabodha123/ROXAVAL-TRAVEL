import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon, Loader2Icon, MessageCircleIcon, PencilIcon, PlusIcon, SendIcon, TrashIcon, UserCheckIcon, WandSparklesIcon, XIcon } from 'lucide-react';
import { apiGetList, apiGetOne, apiPatch, apiPost, ApiRequestError, API_ORIGIN } from '../../../lib/api';
import { whatsAppLink } from '../../../lib/contact';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Timeline } from '../../../components/ui/Timeline';
import { resolveRequestStage } from '../../../lib/tourTimeline';
import { MessagingPanel } from '../../../components/messaging/MessagingPanel';
import { NotesBlock } from '../../../components/quotation/NotesBlock';
import {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
  CheckboxField,
  RepeatSection,
  CollapsibleRow,
  TagListInput,
  FieldWrap } from
'../../components/fields/Fields';
import { HotelPickerModal, type RoomOccupancy } from '../../components/itinerary-picker/HotelPickerModal';
import { ActivityPickerModal } from '../../components/itinerary-picker/ActivityPickerModal';
import { TransferPickerModal } from '../../components/itinerary-picker/TransferPickerModal';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];

const DEFAULT_INCLUSIONS = `Accommodation in 3-Star or 4-Star Hotels
Comfortable rooms with modern amenities, including daily breakfast and dinner as per the itinerary.

Chauffeur Guide With Luxury Car/Van
Professional, English-speaking chauffeur guide to accompany you throughout the journey.

All Sightseeing & Excursions
Visits to all major attractions mentioned in the itinerary.

Airport Pickup & Drop-off
Meet-and-greet on arrival and smooth departure transfer at the end of the tour.

Private Transport Throughout the Tour
Fully air-conditioned luxury vehicle for your exclusive use.`;

const DEFAULT_EXCLUSIONS = `Air Tickets
Visa Fee
Lunch and any other meals not mentioned in the itinerary
Personal Expenses such as laundry, tips, telephone calls, mini-bar, etc.
Early Check-in & Late Checkout Charges at hotels
Entrance Tickets to sightseeing places and activities`;

const DEFAULT_CANCELLATION_POLICY = `Payment Policy
- Deposit: 50% of the total package cost is required at the time of booking to secure your reservation.
- Balance Payment: The remaining 50% must be paid no later than 14 days before or on arrival day in Sri Lanka.
- For last-minute bookings (within 14 days of travel), full payment is required upon confirmation.
- Payments can be made via bank transfer or cash on arrival.

Cancellation Policy
- More than 30 days before arrival: Full refund of deposit (minus any bank/transaction charges).
- 15–29 days before arrival: 50% of the deposit will be refunded.
- 14 days or less before arrival / No-show: No refund.
- Hotel cancellation policies may vary and will be applied accordingly.`;

const DEFAULT_CUSTOMER_FACING_NOTES = `IMPORTANT NOTES
This is just a quote; no reservations have been held yet or booking has not proceeded yet.
The rooms & rates are subject to availability at the time of booking / confirmation.
Hotel, sightseeing, meals, and transfer rates might change without prior notice until & unless the tour has been booked or confirmed from your end.
The change in dates will attract a re-quote.
Normal hotel check-in time is from 14:00 hours onwards & check-out time is at 12:00 hrs.
The above cost does not include any kind of surcharge, if applicable, during the given travel period.
Quotation might change due to currency rate fluctuation during confirmation & booking process (for international tours).
We are not responsible for any loss of your valuables like mobiles, bags, jewellery & money.

ADDITIONAL INFORMATION
Booking & Confirmation: A booking is confirmed once Roxaval Travels receives the initial deposit and a written/email/WhatsApp confirmation from the client.
All bookings are subject to availability of hotels, transport, and activities at the time of reservation.
Passport copies for all travelers must be provided at the time of booking for hotel check-in purposes.

Account Details
Bank Name: Hatton National Bank
Account Number: 119010103701
Bank Code: 119
Company Name: Roxaval Travels Pvt Ltd
Swift Code: HBLILKLX

Note: Above quote is based on the current rate of exchange. If the rate of exchange changes at the time of final billing, the package quote will change accordingly.

+94 77 880 3522 | bookings@roxavaltravels.com | www.roxavaltravels.com`;

interface RefOption {
  value: string;
  label: string;
}

interface ActivityPricingEntry {
  activity: string;
  name?: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  cost: number;
  selected: boolean;
}

interface TransferEntry {
  transfer: string;
  name?: string;
  withDriver: boolean;
  vehicleCount: number;
  cost: number;
  selected: boolean;
}

interface FlightEntry {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  cost: number;
  selected: boolean;
}

interface HotelOptionEntry {
  hotel: string;
  hotelName?: string;
  roomType: string;
  numberOfRooms: number;
  roomOccupancy: RoomOccupancy;
  roomCost: number;
  selected: boolean;
}

interface ItineraryDayForm {
  _key: string;
  dayNumber: number;
  date: string;
  title: string;
  schedule: string;
  destinations: string[];
  activities: string[];
  customDestinations: string[];
  customActivities: string[];
  hotel: string;
  roomType: string;
  numberOfRooms: number;
  roomOccupancy: RoomOccupancy;
  roomCost: number;
  hotelOptions: HotelOptionEntry[];
  meals: string[];
  transport: string;
  activityPricing: ActivityPricingEntry[];
  transfers: TransferEntry[];
  flights: FlightEntry[];
  dayCost: number;
  arrivalTime: string;
  departureTime: string;
  travelTime: string;
  notes: string;
}

interface RouteLeg {
  id: string;
  departure: string;
  arrival: string;
  fromDate: string;
  toDate: string;
  nights: number;
}

interface ItineraryVersion {
  version: number;
  title: string;
  changedAt: string;
  changedBy?: { user?: { fullName?: string } };
}

interface ItineraryDetail {
  _id: string;
  title: string;
  summary: string;
  days: { dayNumber: number; date?: string; title: string; schedule: string; destinations?: { _id: string; name: string }[]; activities?: { _id: string; name: string }[]; customDestinations?: string[]; customActivities?: string[]; hotel?: { _id: string; name: string }; roomType?: string; numberOfRooms?: number; roomOccupancy?: RoomOccupancy; roomCost?: number; hotelOptions?: { hotel?: { _id: string; name: string }; roomType?: string; numberOfRooms?: number; roomOccupancy?: RoomOccupancy; roomCost?: number; selected?: boolean }[]; meals: string[]; transport: string; activityPricing?: { activity?: { _id: string; name: string }; adultCount: number; childCount: number; infantCount: number; cost: number; selected?: boolean }[]; transfers?: { transfer?: { _id: string; name: string; supplier?: string }; withDriver: boolean; vehicleCount: number; cost: number; selected?: boolean }[]; flights?: { airline?: string; flightNumber?: string; from?: string; to?: string; departureTime?: string; arrivalTime?: string; cost?: number; selected?: boolean }[]; dayCost?: number; arrivalTime?: string; departureTime?: string; travelTime?: string; notes: string }[];
  hotels: { _id: string; name: string }[];
  tourGuide?: { _id: string; name: string };
  vehicle?: { _id: string; name: string };
  pricing: { basePrice: number; discount: number; totalPrice: number; currency: string; pricePerPerson: boolean };
  sightseeingIncluded?: boolean;
  adminNotes: string;
  customerFacingNotes: string;
  visaRequirements?: string;
  travelInsurance?: string;
  cancellationPolicy?: string;
  inclusions?: string;
  exclusions?: string;
  status: string;
  version: number;
  versionHistory: ItineraryVersion[];
}

interface RequestDetail {
  _id: string;
  referenceNumber: string;
  customer?: { user?: { fullName?: string; email?: string; phone?: string } };
  travelDates: { startDate: string; endDate: string; isFlexible: boolean };
  travelers: { adults: number; children: number; infants: number; childAges?: number[]; infantAges?: number[] };
  leadSource?: string;
  operationPerson?: { _id: string; user?: { fullName?: string } };
  salesPerson?: { _id: string; user?: { fullName?: string } };
  company?: string;
  preferredDestinations: { _id: string; name: string }[];
  preferredActivities: { _id: string; name: string }[];
  customDestinations: string[];
  customActivities: string[];
  hotelCategory: string;
  mealPreferences: string[];
  roomTypePreference?: string;
  travelStyle: string;
  transportPreference?: string;
  guideRequired?: boolean;
  estimatedBudget: { amount: number; currency: string; perPerson: boolean };
  sightseeingPreference?: string;
  specialRequests: string;
  status: string;
  priority: string;
  assignedAdmin?: string;
  itinerary?: ItineraryDetail;
  revisionHistory: { action: string; note: string; at: string }[];
}

const makeKey = () => Math.random().toString(36).slice(2);

const emptyOccupancy = (): RoomOccupancy => ({ single: 0, double: 0, triple: 0, quad: 0, extraBed: 0, childWithBed: 0, childNoBed: 0, infant: 0 });

const emptyDay = (n: number): ItineraryDayForm => ({
  _key: makeKey(), dayNumber: n, date: '', title: '', schedule: '', destinations: [], activities: [], customDestinations: [], customActivities: [],
  hotel: '', roomType: '', numberOfRooms: 1, roomOccupancy: emptyOccupancy(), roomCost: 0, hotelOptions: [], meals: [], transport: '',
  activityPricing: [], transfers: [], flights: [], dayCost: 0,
  arrivalTime: '', departureTime: '', travelTime: '', notes: ''
});

const dayCostOf = (d: Pick<ItineraryDayForm, 'roomCost' | 'activityPricing' | 'transfers' | 'flights'>, opts: { excludeSightseeing?: boolean } = {}) =>
(d.roomCost || 0) +
(opts.excludeSightseeing ? 0 : (d.activityPricing || []).filter((a) => a.selected !== false).reduce((s, a) => s + (a.cost || 0), 0)) +
(d.transfers || []).filter((t) => t.selected !== false).reduce((s, t) => s + (t.cost || 0), 0) +
(d.flights || []).filter((f) => f.selected !== false).reduce((s, f) => s + (f.cost || 0), 0);

function FlightMiniForm({ onAdd }: { onAdd: (f: Omit<FlightEntry, 'selected'>) => void }) {
  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [cost, setCost] = useState(0);

  const add = () => {
    if (!airline.trim() && !flightNumber.trim()) return;
    onAdd({ airline, flightNumber, from, to, departureTime, arrivalTime, cost });
    setAirline('');
    setFlightNumber('');
    setFrom('');
    setTo('');
    setDepartureTime('');
    setArrivalTime('');
    setCost(0);
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      <input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Airline" className="col-span-1 rounded-lg border border-forest/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald" />
      <input value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="Flight #" className="col-span-1 rounded-lg border border-forest/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald" />
      <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From" className="col-span-1 rounded-lg border border-forest/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald" />
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" className="col-span-1 rounded-lg border border-forest/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald" />
      <input value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} placeholder="Dep. time" className="col-span-1 rounded-lg border border-forest/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald" />
      <input type="number" min={0} value={cost} onChange={(e) => setCost(Number(e.target.value) || 0)} placeholder="Cost" className="col-span-1 rounded-lg border border-forest/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald" />
      <button type="button" onClick={add} className="col-span-1 rounded-lg bg-cream px-2 py-1.5 text-xs font-semibold text-forest hover:bg-emerald/10">+ Add Flight</button>
    </div>);

}

export function AdminCustomRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [sending, setSending] = useState(false);
  // Manually re-opens the builder over an already-sent itinerary so admins
  // can tweak and resend it, without the customer having to request changes first.
  const [forceEdit, setForceEdit] = useState(false);

  const [destOptions, setDestOptions] = useState<RefOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<RefOption[]>([]);
  const [hotelOptions, setHotelOptions] = useState<RefOption[]>([]);
  const [guideOptions, setGuideOptions] = useState<RefOption[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<RefOption[]>([]);
  const [guidePricePerDay, setGuidePricePerDay] = useState<Record<string, number>>({});
  const [vehiclePricePerDay, setVehiclePricePerDay] = useState<Record<string, number>>({});

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [days, setDays] = useState<ItineraryDayForm[]>([emptyDay(1)]);
  const [hotels, setHotels] = useState<string[]>([]);
  const [tourGuide, setTourGuide] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [pricePerPerson, setPricePerPerson] = useState(true);
  const [sightseeingIncluded, setSightseeingIncluded] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [customerFacingNotes, setCustomerFacingNotes] = useState(DEFAULT_CUSTOMER_FACING_NOTES);
  const [visaRequirements, setVisaRequirements] = useState('');
  const [travelInsurance, setTravelInsurance] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState(DEFAULT_CANCELLATION_POLICY);
  const [inclusions, setInclusions] = useState(DEFAULT_INCLUSIONS);
  const [exclusions, setExclusions] = useState(DEFAULT_EXCLUSIONS);

  const [routeLegs, setRouteLegs] = useState<RouteLeg[]>([]);
  const [legDeparture, setLegDeparture] = useState('');
  const [legArrival, setLegArrival] = useState('');
  const [legFromDate, setLegFromDate] = useState('');
  const [legToDate, setLegToDate] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [pickerDayIndex, setPickerDayIndex] = useState<number | null>(null);
  const [pickerKind, setPickerKind] = useState<'hotel' | 'activity' | 'transfer' | null>(null);

  const [savingPriority, setSavingPriority] = useState(false);
  const [cannotModifyOpen, setCannotModifyOpen] = useState(false);
  const [cannotModifyNote, setCannotModifyNote] = useState('');
  const [cannotModifySubmitting, setCannotModifySubmitting] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

  const load = () => {
    if (!id) return;
    apiGetOne<RequestDetail>(`/custom-tours/${id}`).then(setRequest).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  useEffect(() => {
    Promise.all([
    apiGetList<{ _id: string; name: string }>('/destinations', { limit: 100 }),
    apiGetList<{ _id: string; name: string }>('/activities', { limit: 100 }),
    apiGetList<{ _id: string; name: string }>('/hotels', { limit: 100 }),
    apiGetList<{ _id: string; name: string; pricePerDay: number }>('/tour-guides', { limit: 100 }),
    apiGetList<{ _id: string; name: string; pricePerDay: number }>('/vehicles', { limit: 100 })]
    ).then(([d, a, h, g, v]) => {
      setDestOptions(d.data.map((x) => ({ value: x._id, label: x.name })));
      setActivityOptions(a.data.map((x) => ({ value: x._id, label: x.name })));
      setHotelOptions(h.data.map((x) => ({ value: x._id, label: x.name })));
      setGuideOptions(g.data.map((x) => ({ value: x._id, label: x.name })));
      setVehicleOptions(v.data.map((x) => ({ value: x._id, label: x.name })));
      setGuidePricePerDay(Object.fromEntries(g.data.map((x) => [x._id, x.pricePerDay || 0])));
      setVehiclePricePerDay(Object.fromEntries(v.data.map((x) => [x._id, x.pricePerDay || 0])));
    });
  }, []);

  useEffect(() => {
    if (!request) return;
    setCurrency(request.estimatedBudget.currency);
    if (request.itinerary && !forceEdit && !['Changes Requested', 'Rejected'].includes(request.itinerary.status)) return;
    if (request.itinerary) {
      const itin = request.itinerary;
      setTitle(itin.title);
      setSummary(itin.summary);
      setDays(itin.days.map((d) => ({
        _key: makeKey(),
        dayNumber: d.dayNumber,
        date: d.date ? d.date.slice(0, 10) : '',
        title: d.title,
        schedule: d.schedule,
        destinations: (d.destinations || []).map((x) => x._id),
        activities: (d.activities || []).map((x) => x._id),
        customDestinations: d.customDestinations || [],
        customActivities: d.customActivities || [],
        hotel: d.hotel?._id || '',
        roomType: d.roomType || '',
        numberOfRooms: d.numberOfRooms || 1,
        roomOccupancy: { ...emptyOccupancy(), ...d.roomOccupancy },
        roomCost: d.roomCost || 0,
        hotelOptions: (d.hotelOptions || []).map((ho) => ({
          hotel: ho.hotel?._id || '',
          hotelName: ho.hotel?.name,
          roomType: ho.roomType || '',
          numberOfRooms: ho.numberOfRooms || 1,
          roomOccupancy: { ...emptyOccupancy(), ...ho.roomOccupancy },
          roomCost: ho.roomCost || 0,
          selected: ho.selected ?? false
        })),
        meals: d.meals || [],
        transport: d.transport || '',
        activityPricing: (d.activityPricing || []).map((ap) => ({
          activity: ap.activity?._id || '',
          name: ap.activity?.name,
          adultCount: ap.adultCount || 0,
          childCount: ap.childCount || 0,
          infantCount: ap.infantCount || 0,
          cost: ap.cost || 0,
          selected: ap.selected ?? true
        })),
        transfers: (d.transfers || []).map((t) => ({
          transfer: t.transfer?._id || '',
          name: t.transfer?.name,
          withDriver: t.withDriver ?? true,
          vehicleCount: t.vehicleCount || 1,
          cost: t.cost || 0,
          selected: t.selected ?? true
        })),
        flights: (d.flights || []).map((f) => ({
          airline: f.airline || '',
          flightNumber: f.flightNumber || '',
          from: f.from || '',
          to: f.to || '',
          departureTime: f.departureTime || '',
          arrivalTime: f.arrivalTime || '',
          cost: f.cost || 0,
          selected: f.selected ?? true
        })),
        dayCost: d.dayCost || 0,
        arrivalTime: d.arrivalTime || '',
        departureTime: d.departureTime || '',
        travelTime: d.travelTime || '',
        notes: d.notes || ''
      })));
      setHotels(itin.hotels.map((h) => h._id));
      setTourGuide(itin.tourGuide?._id || '');
      setVehicle(itin.vehicle?._id || '');
      setBasePrice(itin.pricing.basePrice);
      setDiscount(itin.pricing.discount);
      setTotalPrice(itin.pricing.totalPrice);
      setCurrency(itin.pricing.currency);
      setPricePerPerson(itin.pricing.pricePerPerson);
      setSightseeingIncluded(itin.sightseeingIncluded ?? true);
      setAdminNotes(itin.adminNotes);
      setCustomerFacingNotes(itin.customerFacingNotes || DEFAULT_CUSTOMER_FACING_NOTES);
      setVisaRequirements(itin.visaRequirements || '');
      setTravelInsurance(itin.travelInsurance || '');
      setCancellationPolicy(itin.cancellationPolicy || DEFAULT_CANCELLATION_POLICY);
      setInclusions(itin.inclusions || DEFAULT_INCLUSIONS);
      setExclusions(itin.exclusions || DEFAULT_EXCLUSIONS);
      setRouteLegs([]);
      setExpandedDays(new Set());
    } else {
      setTitle(`Custom Itinerary for ${request.referenceNumber}`);
      setBasePrice(request.estimatedBudget.amount);
      setTotalPrice(request.estimatedBudget.amount);
      setSightseeingIncluded(request.sightseeingPreference !== 'Exclude');
      setTourGuide('');
      setVehicle('');
      setVisaRequirements('');
      setTravelInsurance('');
      setCancellationPolicy(DEFAULT_CANCELLATION_POLICY);
      setInclusions(DEFAULT_INCLUSIONS);
      setExclusions(DEFAULT_EXCLUSIONS);
      setCustomerFacingNotes(DEFAULT_CUSTOMER_FACING_NOTES);
      setRouteLegs([]);
      if (request.roomTypePreference) {
        setDays([{ ...emptyDay(1), roomType: request.roomTypePreference }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, forceEdit]);

  const updateDay = (index: number, patch: Partial<ItineraryDayForm>) => {
    setDays((prev) => prev.map((d, i) => i === index ? { ...d, ...patch } : d));
  };
  const addDay = () => {
    setDays((prev) => {
      const newDay = emptyDay(prev.length + 1);
      setExpandedDays((exp) => new Set(exp).add(newDay._key));
      return [...prev, newDay];
    });
  };
  const removeDay = (index: number) => setDays((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 })));
  const moveDay = (index: number, dir: -1 | 1) => {
    setDays((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    });
  };
  const toggleDayExpanded = (key: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const patchDayWithCost = (index: number, patch: Partial<ItineraryDayForm>) => {
    setDays((prev) => prev.map((d, i) => {
      if (i !== index) return d;
      const next = { ...d, ...patch };
      return { ...next, dayCost: dayCostOf(next) };
    }));
  };

  // Hotel selections are kept as visible alternates rather than overwritten —
  // the picker appends a candidate; the first one added for a day becomes
  // primary automatically, and its fields are mirrored onto the day's legacy
  // hotel/roomType/numberOfRooms/roomOccupancy/roomCost so hotel vouchers/PDFs
  // (which only read those) are unaffected.
  const mirrorPrimaryHotel = (day: Pick<ItineraryDayForm, 'hotelOptions'>) => {
    const primary = day.hotelOptions.find((h) => h.selected);
    return primary ?
    { hotel: primary.hotel, roomType: primary.roomType, numberOfRooms: primary.numberOfRooms, roomOccupancy: primary.roomOccupancy, roomCost: primary.roomCost } :
    { hotel: '', roomType: '', numberOfRooms: 1, roomOccupancy: emptyOccupancy(), roomCost: 0 };
  };

  const applyHotelSelection = (sel: { hotel: string; roomType: string; numberOfRooms: number; roomOccupancy: RoomOccupancy; roomCost: number }) => {
    if (pickerDayIndex === null) return;
    const day = days[pickerDayIndex];
    const option: HotelOptionEntry = { ...sel, hotelName: hotelOptions.find((h) => h.value === sel.hotel)?.label, selected: day.hotelOptions.length === 0 };
    const nextOptions = [...day.hotelOptions, option];
    patchDayWithCost(pickerDayIndex, { hotelOptions: nextOptions, ...mirrorPrimaryHotel({ hotelOptions: nextOptions }) });
  };

  const setPrimaryHotelOption = (dayIndex: number, optionIndex: number) => {
    const day = days[dayIndex];
    const nextOptions = day.hotelOptions.map((h, i) => ({ ...h, selected: i === optionIndex }));
    patchDayWithCost(dayIndex, { hotelOptions: nextOptions, ...mirrorPrimaryHotel({ hotelOptions: nextOptions }) });
  };

  const removeHotelOption = (dayIndex: number, optionIndex: number) => {
    const day = days[dayIndex];
    const wasPrimary = day.hotelOptions[optionIndex]?.selected;
    let nextOptions = day.hotelOptions.filter((_, i) => i !== optionIndex);
    if (wasPrimary && nextOptions.length > 0) nextOptions = nextOptions.map((h, i) => ({ ...h, selected: i === 0 }));
    patchDayWithCost(dayIndex, { hotelOptions: nextOptions, ...mirrorPrimaryHotel({ hotelOptions: nextOptions }) });
  };

  const addActivitySelection = (sel: { activity: string; name: string; adultCount: number; childCount: number; infantCount: number; cost: number }) => {
    if (pickerDayIndex === null) return;
    const day = days[pickerDayIndex];
    patchDayWithCost(pickerDayIndex, {
      activities: [...day.activities, sel.activity],
      activityPricing: [...day.activityPricing, { ...sel, selected: true }]
    });
  };

  const removeActivitySelection = (activityId: string) => {
    if (pickerDayIndex === null) return;
    const day = days[pickerDayIndex];
    patchDayWithCost(pickerDayIndex, {
      activities: day.activities.filter((a) => a !== activityId),
      activityPricing: day.activityPricing.filter((a) => a.activity !== activityId)
    });
  };

  const toggleActivitySelected = (dayIndex: number, activityId: string) => {
    const day = days[dayIndex];
    patchDayWithCost(dayIndex, {
      activityPricing: day.activityPricing.map((a) => a.activity === activityId ? { ...a, selected: !a.selected } : a)
    });
  };

  const addTransferSelection = (sel: { transfer: string; name: string; withDriver: boolean; vehicleCount: number; cost: number }) => {
    if (pickerDayIndex === null) return;
    const day = days[pickerDayIndex];
    patchDayWithCost(pickerDayIndex, { transfers: [...day.transfers, { ...sel, selected: true }] });
  };

  const removeTransferAt = (dayIndex: number, transferIndex: number) => {
    const day = days[dayIndex];
    patchDayWithCost(dayIndex, { transfers: day.transfers.filter((_, i) => i !== transferIndex) });
  };

  const toggleTransferSelected = (dayIndex: number, transferIndex: number) => {
    const day = days[dayIndex];
    patchDayWithCost(dayIndex, { transfers: day.transfers.map((t, i) => i === transferIndex ? { ...t, selected: !t.selected } : t) });
  };

  const addFlight = (dayIndex: number, flight: Omit<FlightEntry, 'selected'>) => {
    const day = days[dayIndex];
    patchDayWithCost(dayIndex, { flights: [...day.flights, { ...flight, selected: true }] });
  };

  const removeFlightAt = (dayIndex: number, flightIndex: number) => {
    const day = days[dayIndex];
    patchDayWithCost(dayIndex, { flights: day.flights.filter((_, i) => i !== flightIndex) });
  };

  const toggleFlightSelected = (dayIndex: number, flightIndex: number) => {
    const day = days[dayIndex];
    patchDayWithCost(dayIndex, { flights: day.flights.map((f, i) => i === flightIndex ? { ...f, selected: !f.selected } : f) });
  };

  const openPicker = (index: number, kind: 'hotel' | 'activity' | 'transfer') => {
    setPickerDayIndex(index);
    setPickerKind(kind);
  };
  const closePicker = () => {
    setPickerDayIndex(null);
    setPickerKind(null);
  };

  const guideVehicleCost = (tourGuide ? (guidePricePerDay[tourGuide] || 0) * days.length : 0) +
  (vehicle ? (vehiclePricePerDay[vehicle] || 0) * days.length : 0);
  const suggestedTotalWithSightseeing = days.reduce((sum, d) => sum + dayCostOf(d), 0) + guideVehicleCost;
  const suggestedTotalWithoutSightseeing = days.reduce((sum, d) => sum + dayCostOf(d, { excludeSightseeing: true }), 0) + guideVehicleCost;
  const suggestedTotal = sightseeingIncluded ? suggestedTotalWithSightseeing : suggestedTotalWithoutSightseeing;

  const useSuggestedTotal = () => {
    setBasePrice(suggestedTotal);
    setTotalPrice(suggestedTotal - discount);
  };

  const lastLegToDate = routeLegs.length > 0 ? routeLegs[routeLegs.length - 1].toDate : '';

  const addRouteLeg = () => {
    if (!legDeparture.trim() || !legArrival.trim() || !legFromDate || !legToDate) {
      toast('Please fill in departure, arrival and both dates.', 'error');
      return;
    }
    if (lastLegToDate && legFromDate < lastLegToDate) {
      toast('From Date cannot be earlier than the previous leg\'s To Date.', 'error');
      return;
    }
    if (legToDate < legFromDate) {
      toast('To Date must be on or after From Date.', 'error');
      return;
    }
    const nights = Math.round((new Date(legToDate).getTime() - new Date(legFromDate).getTime()) / 86400000);
    const dayCount = Math.max(nights, 1);
    const matchedDestId = destOptions.find((d) => d.label.trim().toLowerCase() === legArrival.trim().toLowerCase())?.value;
    setDays((prev) => {
      // The form always starts with one untouched blank day — replace it
      // instead of leaving it orphaned alongside the generated days (it has
      // no title/schedule, which silently blocks native form submission).
      const isPristineStarterDay = prev.length === 1 && !prev[0].title && !prev[0].schedule && !prev[0].hotel && prev[0].activities.length === 0;
      const base = isPristineStarterDay ? [] : prev;
      const newDays: ItineraryDayForm[] = [];
      for (let i = 0; i < dayCount; i += 1) {
        const dayNumber = base.length + newDays.length + 1;
        const date = new Date(legFromDate);
        date.setDate(date.getDate() + i);
        newDays.push({
          ...emptyDay(dayNumber),
          title: i === 0 ? `${legDeparture} → ${legArrival}` : `${legArrival} – Day ${i + 1}`,
          date: date.toISOString().slice(0, 10),
          destinations: matchedDestId ? [matchedDestId] : []
        });
      }
      return [...base, ...newDays];
    });
    setRouteLegs((prev) => [...prev, { id: makeKey(), departure: legDeparture, arrival: legArrival, fromDate: legFromDate, toDate: legToDate, nights }]);
    setLegDeparture(legArrival);
    setLegArrival('');
    setLegFromDate(legToDate);
    setLegToDate('');
  };
  const removeRouteLeg = (legId: string) => setRouteLegs((prev) => prev.filter((l) => l.id !== legId));

  const assignToMe = async () => {
    setAssigning(true);
    try {
      await apiPatch(`/custom-tours/${id}/assign`, {});
      toast('Request assigned to you.');
      load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to assign request.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const savePriority = async (value: string) => {
    setSavingPriority(true);
    try {
      await apiPatch(`/custom-tours/${id}/priority`, { priority: value });
      toast('Priority updated.');
      load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update priority.', 'error');
    } finally {
      setSavingPriority(false);
    }
  };

  const submitCannotModify = async () => {
    if (!cannotModifyNote.trim()) return;
    setCannotModifySubmitting(true);
    try {
      await apiPost(`/custom-tours/${id}/cannot-modify`, { note: cannotModifyNote });
      toast('Explanation sent to the customer.');
      setCannotModifyOpen(false);
      setCannotModifyNote('');
      load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to send explanation.', 'error');
    } finally {
      setCannotModifySubmitting(false);
    }
  };

  const sendItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await apiPost(`/custom-tours/${id}/itinerary`, {
        title,
        summary,
        days: days.map(({ _key, ...d }) => ({ ...d, date: d.date || undefined })),
        hotels,
        tourGuide: tourGuide || undefined,
        vehicle: vehicle || undefined,
        pricing: { basePrice, discount, totalPrice, currency, pricePerPerson },
        sightseeingIncluded,
        adminNotes,
        customerFacingNotes,
        visaRequirements,
        travelInsurance,
        cancellationPolicy,
        inclusions,
        exclusions
      });
      toast('Itinerary sent to customer.');
      setForceEdit(false);
      load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to send itinerary.', 'error');
    } finally {
      setSending(false);
    }
  };

  const generateQuotation = () => {
    const itin = request?.itinerary;
    if (!itin || !id) return;
    const lastDayNumber = Math.max(...itin.days.map((d) => d.dayNumber));
    const uncoveredDay = itin.days.find((d) => {
      // The last day is the departure day — the client flies home, so no
      // hotel is booked for that night.
      const hasHotel = d.dayNumber === lastDayNumber || Boolean(d.hotel);
      const hasSightseeingOrTransfer = (d.activityPricing || []).some((a) => a.selected !== false) || (d.transfers || []).some((t) => t.selected !== false) || Boolean(d.transport);
      return !hasHotel || !hasSightseeingOrTransfer;
    });
    if (uncoveredDay) {
      const missing = uncoveredDay.dayNumber === lastDayNumber ? 'at least one sightseeing/transfer' : 'a hotel and at least one sightseeing/transfer';
      toast(`Day ${uncoveredDay.dayNumber} needs ${missing} before generating the quotation.`, 'error');
      return;
    }
    window.open(`/admin/custom-requests/${id}/quotation`, '_blank');
  };

  if (loading || !request) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  const showBuilder = forceEdit || !request.itinerary || ['Changes Requested', 'Rejected'].includes(request.itinerary.status);

  return (
    <div>
      <PageHeader
        title={`Request ${request.referenceNumber}`}
        subtitle={`Submitted ${new Date(request.travelDates.startDate).toLocaleDateString()}`}
        action={<button onClick={() => navigate('/admin/custom-requests')} className="rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-cream">Back to list</button>} />


      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-forest">Request Details</p>
              <StatusBadge status={request.status} />
            </div>
            <Timeline className="mt-4" {...resolveRequestStage({ requestStatus: request.status, itineraryStatus: request.itinerary?.status })} />
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-forest/50">Query ID</dt><dd className="font-mono text-xs font-semibold text-forest">{request.referenceNumber}</dd></div>
              {request.leadSource &&
              <div className="flex justify-between"><dt className="text-forest/50">Lead Source</dt><dd className="text-forest">{request.leadSource}</dd></div>
              }
              {request.operationPerson?.user?.fullName &&
              <div className="flex justify-between"><dt className="text-forest/50">Operation Person</dt><dd className="text-forest">{request.operationPerson.user.fullName}</dd></div>
              }
              {request.salesPerson?.user?.fullName &&
              <div className="flex justify-between"><dt className="text-forest/50">Sales Person</dt><dd className="text-forest">{request.salesPerson.user.fullName}</dd></div>
              }
              {request.company &&
              <div className="flex justify-between"><dt className="text-forest/50">Company</dt><dd className="text-forest">{request.company}</dd></div>
              }
              <div className="flex justify-between"><dt className="text-forest/50">Travel Dates</dt><dd className="text-forest">{new Date(request.travelDates.startDate).toLocaleDateString()} – {new Date(request.travelDates.endDate).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-forest/50">Travelers</dt><dd className="text-forest">{request.travelers.adults} Adults, {request.travelers.children} Children, {request.travelers.infants} Infants</dd></div>
              {(request.travelers.childAges?.length ?? 0) > 0 &&
              <div className="flex justify-between"><dt className="text-forest/50">Child Ages</dt><dd className="text-forest">{request.travelers.childAges?.join(', ')}</dd></div>
              }
              {(request.travelers.infantAges?.length ?? 0) > 0 &&
              <div className="flex justify-between"><dt className="text-forest/50">Infant Ages</dt><dd className="text-forest">{request.travelers.infantAges?.join(', ')}</dd></div>
              }
              <div className="flex justify-between"><dt className="text-forest/50">Hotel Category</dt><dd className="text-forest">{request.hotelCategory}</dd></div>
              {request.roomTypePreference &&
              <div className="flex justify-between"><dt className="text-forest/50">Room Type Preference</dt><dd className="text-forest">{request.roomTypePreference}</dd></div>
              }
              <div className="flex justify-between"><dt className="text-forest/50">Travel Style</dt><dd className="text-forest">{request.travelStyle}</dd></div>
              {request.transportPreference &&
              <div className="flex justify-between"><dt className="text-forest/50">Vehicle Type</dt><dd className="text-forest">{request.transportPreference}</dd></div>
              }
              <div className="flex justify-between"><dt className="text-forest/50">Guide Required</dt><dd className="text-forest">{request.guideRequired ? 'Yes' : 'No'}</dd></div>
              <div className="flex justify-between"><dt className="text-forest/50">Budget</dt><dd className="text-forest">{request.estimatedBudget.currency} {request.estimatedBudget.amount.toLocaleString()}</dd></div>
              {request.sightseeingPreference && request.sightseeingPreference !== 'No Preference' &&
              <div className="flex justify-between"><dt className="text-forest/50">Sightseeing in Budget</dt><dd className="text-forest">{request.sightseeingPreference}</dd></div>
              }
              <div className="flex items-center justify-between">
                <dt className="text-forest/50">Priority</dt>
                <dd className="flex items-center gap-2">
                  <select
                    value={request.priority}
                    disabled={savingPriority}
                    onChange={(e) => savePriority(e.target.value)}
                    className="rounded-lg border border-forest/15 bg-white px-2 py-1 text-xs font-semibold text-forest outline-none focus:border-emerald disabled:opacity-60">

                    {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <PriorityBadge priority={request.priority} />
                </dd>
              </div>
            </dl>
            {request.preferredDestinations.length > 0 &&
            <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-forest/40">Preferred Destinations</p>
                <p className="mt-1 text-sm text-forest/70">{request.preferredDestinations.map((d) => d.name).join(', ')}</p>
              </div>
            }
            {request.customDestinations?.length > 0 &&
            <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-forest/40">Custom Destinations</p>
                <p className="mt-1 text-sm text-forest/70">{request.customDestinations.join(', ')}</p>
              </div>
            }
            {request.preferredActivities?.length > 0 &&
            <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-forest/40">Preferred Activities</p>
                <p className="mt-1 text-sm text-forest/70">{request.preferredActivities.map((a) => a.name).join(', ')}</p>
              </div>
            }
            {request.customActivities?.length > 0 &&
            <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-forest/40">Custom Activities</p>
                <p className="mt-1 text-sm text-forest/70">{request.customActivities.join(', ')}</p>
              </div>
            }
            {request.specialRequests &&
            <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-forest/40">Special Requests</p>
                <p className="mt-1 text-sm text-forest/70">{request.specialRequests}</p>
              </div>
            }
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Customer</p>
            <p className="mt-3 text-sm font-medium text-forest">{request.customer?.user?.fullName}</p>
            <p className="text-xs text-forest/60">{request.customer?.user?.email}</p>
            <p className="text-xs text-forest/60">{request.customer?.user?.phone}</p>
          </div>

          {!request.assignedAdmin &&
          <button onClick={assignToMe} disabled={assigning} className="flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white hover:bg-emerald disabled:opacity-70">
              {assigning ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <UserCheckIcon className="h-4 w-4" />}
              Assign to Me
            </button>
          }

          {request.revisionHistory.length > 0 &&
          <div className="rounded-2xl bg-white p-6 shadow-soft">
              <p className="font-display text-sm font-semibold text-forest">Revision History</p>
              <div className="mt-3 space-y-3">
                {request.revisionHistory.map((h, i) =>
              <div key={i} className="border-b border-forest/5 pb-2.5 last:border-0">
                    <p className="text-xs font-semibold capitalize text-forest">{h.action.replace(/_/g, ' ')}</p>
                    {h.note && <p className="mt-0.5 text-xs text-forest/60">{h.note}</p>}
                    <p className="mt-0.5 text-[11px] text-forest/40">{new Date(h.at).toLocaleString()}</p>
                  </div>
              )}
              </div>
            </div>
          }

          {request.itinerary && request.itinerary.versionHistory.length > 0 &&
          <div className="rounded-2xl bg-white p-6 shadow-soft">
              <button type="button" onClick={() => setVersionHistoryOpen((v) => !v)} className="flex w-full items-center justify-between">
                <p className="font-display text-sm font-semibold text-forest">Version History ({request.itinerary.versionHistory.length})</p>
                {versionHistoryOpen ? <ChevronUpIcon className="h-4 w-4 text-forest/40" /> : <ChevronDownIcon className="h-4 w-4 text-forest/40" />}
              </button>
              {versionHistoryOpen &&
            <div className="mt-3 space-y-3">
                  {[...request.itinerary.versionHistory].reverse().map((v, i) =>
              <div key={i} className="border-b border-forest/5 pb-2.5 last:border-0">
                      <p className="text-xs font-semibold text-forest">Version {v.version}: {v.title}</p>
                      <p className="mt-0.5 text-[11px] text-forest/40">
                        {v.changedBy?.user?.fullName ? `Edited by ${v.changedBy.user.fullName} · ` : ''}
                        {new Date(v.changedAt).toLocaleString()}
                      </p>
                    </div>
              )}
                </div>
            }
            </div>
          }

          <MessagingPanel requestId={request._id} />
        </div>

        <div>
          {!showBuilder && request.itinerary ?
          <div className="rounded-2xl bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold text-forest">{request.itinerary.title}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setForceEdit(true)} className="flex items-center gap-1.5 rounded-full border border-forest/15 px-3.5 py-1.5 text-xs font-semibold text-forest hover:bg-cream">
                    <PencilIcon className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={generateQuotation} className="flex items-center gap-1.5 rounded-full border border-forest/15 px-3.5 py-1.5 text-xs font-semibold text-forest hover:bg-cream">
                    <DownloadIcon className="h-3.5 w-3.5" /> Generate Quotation
                  </button>
                  {request.customer?.user?.phone &&
                <a
                  href={whatsAppLink(
                    `Hi ${request.customer.user.fullName || ''}, your Roxaval Travels quotation for ${request.referenceNumber} is ready! View it here: ${window.location.origin}/my-tours/requests/${request._id}/quotation`,
                    request.customer.user.phone.replace(/\D/g, '')
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-emerald px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-light">

                      <MessageCircleIcon className="h-3.5 w-3.5" /> Send via WhatsApp
                    </a>
                }
                  <StatusBadge status={request.itinerary.status} />
                </div>
              </div>
              {request.itinerary.summary && <p className="mt-2 text-sm text-forest/60">{request.itinerary.summary}</p>}
              {(request.itinerary.tourGuide || request.itinerary.vehicle) &&
            <p className="mt-2 text-xs text-forest/60">
                  {request.itinerary.tourGuide && <span>Guide: {request.itinerary.tourGuide.name}</span>}
                  {request.itinerary.vehicle && <span>{request.itinerary.tourGuide ? ' · ' : ''}Vehicle: {request.itinerary.vehicle.name}</span>}
                </p>
            }
              <div className="mt-4 space-y-3">
                {request.itinerary.days.map((d) =>
              <div key={d.dayNumber} className="rounded-xl bg-cream/50 p-4">
                    <p className="text-sm font-semibold text-forest">Day {d.dayNumber}{d.date ? ` · ${new Date(d.date).toLocaleDateString()}` : ''}: {d.title}</p>
                    <p className="mt-1 text-xs text-forest/60">{d.schedule}</p>
                    {d.hotel &&
                <p className="mt-1.5 text-xs text-forest/50">{d.hotel.name}{d.roomType ? ` (${d.roomType})` : ''}</p>
                }
                    {(d.arrivalTime || d.departureTime || d.travelTime) &&
                <p className="mt-1 text-xs text-forest/50">
                        {d.arrivalTime && <span>Arrive {d.arrivalTime}</span>}
                        {d.departureTime && <span>{d.arrivalTime ? ' · ' : ''}Depart {d.departureTime}</span>}
                        {d.travelTime && <span>{d.arrivalTime || d.departureTime ? ' · ' : ''}Travel {d.travelTime}</span>}
                      </p>
                }
                    {((d.customDestinations && d.customDestinations.length > 0) || (d.customActivities && d.customActivities.length > 0)) &&
                <p className="mt-1 text-xs italic text-forest/40">
                        {[...(d.customDestinations || []), ...(d.customActivities || [])].join(', ')}
                      </p>
                }
                  </div>
              )}
              </div>
              {(request.itinerary.visaRequirements || request.itinerary.travelInsurance || request.itinerary.cancellationPolicy || request.itinerary.inclusions || request.itinerary.exclusions) &&
              <div className="mt-4 grid gap-4 border-t border-forest/10 pt-4 sm:grid-cols-2">
                  {request.itinerary.visaRequirements &&
                <div>
                      <p className="text-xs font-semibold text-forest">Visa Requirements</p>
                      <div className="mt-1.5"><NotesBlock text={request.itinerary.visaRequirements} /></div>
                    </div>
                }
                  {request.itinerary.travelInsurance &&
                <div>
                      <p className="text-xs font-semibold text-forest">Travel Insurance</p>
                      <div className="mt-1.5"><NotesBlock text={request.itinerary.travelInsurance} /></div>
                    </div>
                }
                  {request.itinerary.cancellationPolicy &&
                <div>
                      <p className="text-xs font-semibold text-forest">Cancellation Policy</p>
                      <div className="mt-1.5"><NotesBlock text={request.itinerary.cancellationPolicy} /></div>
                    </div>
                }
                  {request.itinerary.inclusions &&
                <div>
                      <p className="text-xs font-semibold text-forest">Inclusions</p>
                      <div className="mt-1.5"><NotesBlock text={request.itinerary.inclusions} /></div>
                    </div>
                }
                  {request.itinerary.exclusions &&
                <div>
                      <p className="text-xs font-semibold text-forest">Exclusions</p>
                      <div className="mt-1.5"><NotesBlock text={request.itinerary.exclusions} /></div>
                    </div>
                }
                </div>
              }
              <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-4">
                <div>
                  <span className="text-sm text-forest/60">Total Price</span>
                  <p className="text-xs text-forest/40">{request.itinerary.sightseeingIncluded === false ? 'Sightseeing & activities not included' : 'Includes sightseeing & activities'}</p>
                </div>
                <span className="font-display text-xl font-semibold text-forest">{request.itinerary.pricing.currency} {request.itinerary.pricing.totalPrice.toLocaleString()}</span>
              </div>
            </div> :

          <form onSubmit={sendItinerary} className="space-y-6">
              {forceEdit &&
            <div className="flex items-center justify-between rounded-2xl border border-forest/15 bg-cream/60 px-5 py-3">
                  <p className="text-xs text-forest/60">Editing the itinerary that was already sent. Resend below to update the customer, or discard your changes.</p>
                  <button type="button" onClick={() => setForceEdit(false)} className="shrink-0 rounded-full border border-forest/15 px-3.5 py-1.5 text-xs font-semibold text-forest hover:bg-white">
                    Discard &amp; Go Back
                  </button>
                </div>
            }
              {request.itinerary?.status === 'Changes Requested' &&
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div className="flex-1">
                      <p className="font-display text-sm font-semibold text-forest">Can't make this change?</p>
                      <p className="mt-1 text-xs text-forest/60">If the requested change isn't possible, explain why instead of editing below — the customer will see your note and the original itinerary again.</p>
                      {!cannotModifyOpen ?
                  <button type="button" onClick={() => setCannotModifyOpen(true)} className="mt-3 rounded-full border border-forest/20 px-4 py-2 text-xs font-semibold text-forest hover:bg-white">
                          Cannot Modify — Explain Why
                        </button> :

                  <div className="mt-3 space-y-2">
                          <textarea
                      value={cannotModifyNote}
                      onChange={(e) => setCannotModifyNote(e.target.value)}
                      rows={3}
                      minLength={10}
                      placeholder="e.g. We cannot change this hotel because it is fully booked."
                      className="w-full rounded-xl border border-forest/15 bg-white p-3 text-sm outline-none focus:border-emerald" />

                          <div className="flex gap-2">
                            <button type="button" onClick={submitCannotModify} disabled={cannotModifySubmitting || cannotModifyNote.trim().length < 10} className="flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-emerald disabled:opacity-60">
                              {cannotModifySubmitting && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />} Send Explanation
                            </button>
                            <button type="button" onClick={() => { setCannotModifyOpen(false); setCannotModifyNote(''); }} className="rounded-full border border-forest/15 px-4 py-2 text-xs font-semibold text-forest hover:bg-white">
                              Cancel
                            </button>
                          </div>
                        </div>
                  }
                    </div>
                  </div>
                </div>
            }

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <p className="mb-1 font-display text-sm font-semibold text-forest">Route Builder</p>
                <p className="mb-4 text-xs text-forest/50">Quickly lay out the day-by-day route — each leg you add creates the matching day cards below, ready to fill in one by one.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
                  <TextField label="Departure Destination" value={legDeparture} onChange={setLegDeparture} placeholder="e.g. Colombo Airport" />
                  <div>
                    <TextField label="Arrival Destination" value={legArrival} onChange={setLegArrival} placeholder="e.g. Sigiriya" list="route-arrival-destinations" />
                    <datalist id="route-arrival-destinations">
                      {destOptions.map((d) => <option key={d.value} value={d.label} />)}
                    </datalist>
                  </div>
                  <TextField label="From Date" type="date" value={legFromDate} onChange={setLegFromDate} min={lastLegToDate || undefined} />
                  <TextField label="To Date" type="date" value={legToDate} onChange={setLegToDate} min={legFromDate || undefined} />
                  <button type="button" onClick={addRouteLeg} className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-light">
                    <PlusIcon className="h-4 w-4" /> Add
                  </button>
                </div>
                {routeLegs.length > 0 &&
              <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase text-forest/40">
                          <th className="pb-2 pr-3 font-semibold">Departure</th>
                          <th className="pb-2 pr-3 font-semibold">Arrival</th>
                          <th className="pb-2 pr-3 font-semibold">From</th>
                          <th className="pb-2 pr-3 font-semibold">To</th>
                          <th className="pb-2 pr-3 font-semibold">Nights</th>
                          <th className="pb-2 font-semibold" />
                        </tr>
                      </thead>
                      <tbody>
                        {routeLegs.map((leg) =>
                    <tr key={leg.id} className="border-t border-forest/5">
                            <td className="py-2 pr-3 text-forest">{leg.departure}</td>
                            <td className="py-2 pr-3 text-forest">{leg.arrival}</td>
                            <td className="py-2 pr-3 text-forest/70">{new Date(leg.fromDate).toLocaleDateString()}</td>
                            <td className="py-2 pr-3 text-forest/70">{new Date(leg.toDate).toLocaleDateString()}</td>
                            <td className="py-2 pr-3 text-forest/70">{leg.nights}</td>
                            <td className="py-2 text-right">
                              <button type="button" onClick={() => removeRouteLeg(leg.id)} className="text-forest/30 hover:text-red-500"><XIcon className="h-4 w-4" /></button>
                            </td>
                          </tr>
                    )}
                      </tbody>
                    </table>
                  </div>
              }
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <RepeatSection label="Day-by-Day Plan" onAdd={addDay} addLabel="Add Day">
                  {days.map((day, i) =>
                <CollapsibleRow
                  key={day._key}
                  isOpen={expandedDays.has(day._key)}
                  onToggle={() => toggleDayExpanded(day._key)}
                  summary={
                  <>
                        Day {day.dayNumber}{day.date ? ` · ${new Date(day.date).toLocaleDateString()}` : ''} · {day.title || '(untitled)'}
                        {day.hotel ? ` · ${hotelOptions.find((h) => h.value === day.hotel)?.label || ''}` : ''}
                      </>}

                  actions={
                  <>
                        <button type="button" disabled={i === 0} onClick={() => moveDay(i, -1)} className="text-forest/40 hover:text-forest disabled:opacity-20"><ChevronUpIcon className="h-4 w-4" /></button>
                        <button type="button" disabled={i === days.length - 1} onClick={() => moveDay(i, 1)} className="text-forest/40 hover:text-forest disabled:opacity-20"><ChevronDownIcon className="h-4 w-4" /></button>
                        {days.length > 1 &&
                    <button type="button" onClick={() => removeDay(i)} className="ml-1 text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                    }
                      </>}>


                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField label="Title" value={day.title} onChange={(v) => updateDay(i, { title: v })} required minLength={2} />
                        <TextField label="Date" type="date" value={day.date} onChange={(v) => updateDay(i, { date: v })} />
                        <div className="sm:col-span-2 rounded-xl border border-forest/10 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase text-forest/50">Hotel {day.hotelOptions.length > 0 ? `(${day.hotelOptions.length} option${day.hotelOptions.length > 1 ? 's' : ''})` : ''}</p>
                            <button type="button" onClick={() => openPicker(i, 'hotel')} className="text-xs font-semibold text-emerald hover:underline">Add Option</button>
                          </div>
                          {day.hotelOptions.length > 0 ?
                        <div className="mt-2 space-y-1.5">
                              {day.hotelOptions.map((ho, hi) =>
                          <div key={hi} className={`flex items-center justify-between rounded-lg p-2 text-sm ${ho.selected ? 'bg-emerald/10 text-forest' : 'text-forest/60'}`}>
                                  <label className="flex flex-1 cursor-pointer items-center gap-2">
                                    <input type="radio" checked={ho.selected} onChange={() => setPrimaryHotelOption(i, hi)} className="h-3.5 w-3.5 text-emerald focus:ring-emerald" />
                                    <span>{ho.hotelName || hotelOptions.find((h) => h.value === ho.hotel)?.label} — {ho.roomType} ({ho.numberOfRooms} room{ho.numberOfRooms > 1 ? 's' : ''}){ho.selected ? '' : ' · alternate'}</span>
                                  </label>
                                  <span className="flex items-center gap-2">
                                    <span>${ho.roomCost.toLocaleString()}</span>
                                    <button type="button" onClick={() => removeHotelOption(i, hi)} className="text-forest/30 hover:text-red-500"><XIcon className="h-3.5 w-3.5" /></button>
                                  </span>
                                </div>
                          )}
                            </div> :

                        <p className="mt-1 text-xs text-forest/40">Not selected yet.</p>
                        }
                        </div>
                        <div className="sm:col-span-2">
                          <TextAreaField label="Schedule" value={day.schedule} onChange={(v) => updateDay(i, { schedule: v })} rows={2} />
                        </div>
                        <div className="sm:col-span-2 rounded-xl border border-forest/10 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase text-forest/50">Sightseeing</p>
                            <button type="button" onClick={() => openPicker(i, 'activity')} className="text-xs font-semibold text-emerald hover:underline">Browse & Price</button>
                          </div>
                          {day.activityPricing.length > 0 ?
                        <div className="mt-2 space-y-1.5">
                              {day.activityPricing.map((a) =>
                          <div key={a.activity} className={`flex items-center justify-between rounded-lg p-1.5 text-sm ${a.selected ? 'text-forest' : 'text-forest/40'}`}>
                                  <span className="truncate">{a.name || activityOptions.find((o) => o.value === a.activity)?.label}</span>
                                  <span className="flex shrink-0 items-center gap-2">
                                    <span>${a.cost.toLocaleString()}</span>
                                    <button type="button" onClick={() => toggleActivitySelected(i, a.activity)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.selected ? 'bg-emerald/10 text-emerald' : 'bg-forest/5 text-forest/50'}`}>{a.selected ? 'Included' : 'Alternate'}</button>
                                    <button type="button" onClick={() => removeActivitySelection(a.activity)} className="text-forest/30 hover:text-red-500"><XIcon className="h-3.5 w-3.5" /></button>
                                  </span>
                                </div>
                          )}
                            </div> :

                        <p className="mt-1 text-xs text-forest/40">Not selected yet.</p>
                        }
                        </div>
                        <TagListInput label="+ Add Custom Activity" value={day.customActivities} onChange={(v) => updateDay(i, { customActivities: v })} />
                        <div className="rounded-xl border border-forest/10 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase text-forest/50">Transfers</p>
                            <button type="button" onClick={() => openPicker(i, 'transfer')} className="text-xs font-semibold text-emerald hover:underline">Add Transfer</button>
                          </div>
                          {day.transfers.length > 0 ?
                        <div className="mt-2 space-y-1.5">
                              {day.transfers.map((t, ti) =>
                          <div key={ti} className={`flex items-center justify-between text-sm ${t.selected ? 'text-forest' : 'text-forest/40'}`}>
                                  <span className="truncate">{t.name} {t.withDriver ? '(w/ driver)' : '(w/o driver)'} × {t.vehicleCount}</span>
                                  <span className="flex shrink-0 items-center gap-2">
                                    <span>${t.cost.toLocaleString()}</span>
                                    <button type="button" onClick={() => toggleTransferSelected(i, ti)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.selected ? 'bg-emerald/10 text-emerald' : 'bg-forest/5 text-forest/50'}`}>{t.selected ? 'Included' : 'Alternate'}</button>
                                    <button type="button" onClick={() => removeTransferAt(i, ti)} className="text-forest/30 hover:text-red-500"><XIcon className="h-3.5 w-3.5" /></button>
                                  </span>
                                </div>
                          )}
                            </div> :

                        <p className="mt-1 text-xs text-forest/40">None added yet.</p>
                        }
                        </div>
                        <div className="sm:col-span-2 rounded-xl border border-forest/10 p-3">
                          <p className="mb-2 text-xs font-semibold uppercase text-forest/50">Flights</p>
                          {day.flights.length > 0 &&
                        <div className="mb-2 space-y-1.5">
                              {day.flights.map((f, fi) =>
                          <div key={fi} className={`flex items-center justify-between text-sm ${f.selected ? 'text-forest' : 'text-forest/40'}`}>
                                  <span className="truncate">{f.airline} {f.flightNumber} · {f.from} → {f.to} {f.departureTime && `(${f.departureTime})`}</span>
                                  <span className="flex shrink-0 items-center gap-2">
                                    <span>${f.cost.toLocaleString()}</span>
                                    <button type="button" onClick={() => toggleFlightSelected(i, fi)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${f.selected ? 'bg-emerald/10 text-emerald' : 'bg-forest/5 text-forest/50'}`}>{f.selected ? 'Included' : 'Alternate'}</button>
                                    <button type="button" onClick={() => removeFlightAt(i, fi)} className="text-forest/30 hover:text-red-500"><XIcon className="h-3.5 w-3.5" /></button>
                                  </span>
                                </div>
                          )}
                            </div>
                        }
                          <FlightMiniForm onAdd={(f) => addFlight(i, f)} />
                        </div>
                        <div className="sm:col-span-2 flex justify-end border-t border-forest/5 pt-2">
                          <p className="text-sm font-semibold text-forest">Day Cost: ${day.dayCost.toLocaleString()}</p>
                        </div>
                        <FieldWrap label="Meals">
                          <div className="flex gap-3 pt-1.5">
                            {MEAL_OPTIONS.map((m) =>
                        <label key={m} className="flex items-center gap-1.5 text-sm text-forest">
                                <input
                            type="checkbox"
                            checked={day.meals.includes(m)}
                            onChange={() => updateDay(i, { meals: day.meals.includes(m) ? day.meals.filter((x) => x !== m) : [...day.meals, m] })}
                            className="h-4 w-4 rounded border-forest/30 text-emerald focus:ring-emerald" />

                                {m}
                              </label>
                        )}
                          </div>
                        </FieldWrap>
                        <div className="sm:col-span-2">
                          <TextAreaField label="Notes" value={day.notes} onChange={(v) => updateDay(i, { notes: v })} rows={2} />
                        </div>
                      </div>
                    </CollapsibleRow>
                )}
                </RepeatSection>
              </div>

              <div className={`rounded-2xl p-6 shadow-soft ${request.guideRequired ? 'border border-emerald/20 bg-emerald/5' : 'bg-white'}`}>
                <p className="flex items-center gap-2 font-display text-sm font-semibold text-forest">
                  {request.guideRequired && <WandSparklesIcon className="h-4 w-4 text-emerald" />} Tour Guide & Vehicle
                </p>
                {request.guideRequired && <p className="mt-1 text-xs text-forest/60">The customer asked for a tour guide for this trip.</p>}
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <SelectField label="Tour Guide" value={tourGuide} onChange={setTourGuide} options={[{ label: 'None', value: '' }, ...guideOptions]} />
                  <SelectField label="Vehicle" value={vehicle} onChange={setVehicle} options={[{ label: 'None', value: '' }, ...vehicleOptions]} />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-semibold text-forest">Suggested Total (from selections)</p>
                    <p className="mt-1 text-xs text-forest/60">
                      {sightseeingIncluded ?
                    "Sum of every day's hotel, sightseeing and transfer costs, plus guide/vehicle day rates." :
                    "Sum of every day's hotel and transfer costs, plus guide/vehicle day rates — sightseeing/activity costs excluded."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-semibold text-forest">{currency} {suggestedTotal.toLocaleString()}</span>
                    <button type="button" onClick={useSuggestedTotal} className="rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-light">Use this amount</button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-emerald/15 pt-4">
                  <CheckboxField label="Include sightseeing costs in this quotation" checked={sightseeingIncluded} onChange={setSightseeingIncluded} />
                  <p className="text-xs text-forest/50">
                    With: {currency} {suggestedTotalWithSightseeing.toLocaleString()} &nbsp;·&nbsp; Without: {currency} {suggestedTotalWithoutSightseeing.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <p className="mb-4 font-display text-sm font-semibold text-forest">Pricing</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <NumberField label="Base Price" value={basePrice} onChange={setBasePrice} min={0} required />
                  <NumberField label="Discount" value={discount} onChange={setDiscount} min={0} />
                  <NumberField label="Total Price" value={totalPrice} onChange={setTotalPrice} min={0} required />
                  <TextField label="Currency" value={currency} onChange={setCurrency} />
                </div>
                <div className="mt-4">
                  <CheckboxField label="Price is per person" checked={pricePerPerson} onChange={setPricePerPerson} />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <p className="mb-4 font-display text-sm font-semibold text-forest">Quotation Details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextAreaField label="Visa Requirements" value={visaRequirements} onChange={setVisaRequirements} rows={3} />
                  <TextAreaField label="Travel Insurance" value={travelInsurance} onChange={setTravelInsurance} rows={3} />
                  <TextAreaField label="Cancellation Policy" value={cancellationPolicy} onChange={setCancellationPolicy} rows={3} />
                  <TextAreaField label="Inclusions" value={inclusions} onChange={setInclusions} rows={3} />
                  <TextAreaField label="Exclusions" value={exclusions} onChange={setExclusions} rows={3} />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextAreaField label="Admin Notes (internal)" value={adminNotes} onChange={setAdminNotes} rows={3} />
                  <TextAreaField label="Customer-Facing Notes" value={customerFacingNotes} onChange={setCustomerFacingNotes} rows={3} />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={sending} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
                  {sending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                  Send Itinerary to Customer
                </button>
              </div>
            </form>
          }
        </div>
      </div>

      {pickerDayIndex !== null &&
      <HotelPickerModal
        open={pickerKind === 'hotel'}
        onClose={closePicker}
        destinationOptions={destOptions}
        defaultDestination={days[pickerDayIndex]?.destinations[0]}
        travelDate={days[pickerDayIndex]?.date}
        onConfirm={applyHotelSelection} />

      }
      {pickerDayIndex !== null &&
      <ActivityPickerModal
        open={pickerKind === 'activity'}
        onClose={closePicker}
        destinationOptions={destOptions}
        defaultDestination={days[pickerDayIndex]?.destinations[0]}
        secondaryDestination={days[pickerDayIndex + 1]?.destinations[0]}
        travelers={request.travelers}
        selectedIds={days[pickerDayIndex]?.activities || []}
        onAdd={addActivitySelection}
        onRemove={removeActivitySelection} />

      }
      {pickerDayIndex !== null &&
      <TransferPickerModal
        open={pickerKind === 'transfer'}
        onClose={closePicker}
        destinationOptions={destOptions}
        defaultDestination={days[pickerDayIndex]?.destinations[0]}
        onAdd={addTransferSelection} />

      }
    </div>);

}
