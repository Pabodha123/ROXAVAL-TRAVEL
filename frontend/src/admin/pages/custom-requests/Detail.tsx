import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon, Loader2Icon, PlusIcon, SendIcon, TrashIcon, UserCheckIcon, WandSparklesIcon, XIcon } from 'lucide-react';
import { apiGetList, apiGetOne, apiPatch, apiPost, ApiRequestError, API_ORIGIN } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Timeline } from '../../../components/ui/Timeline';
import { resolveRequestStage } from '../../../lib/tourTimeline';
import { MessagingPanel } from '../../../components/messaging/MessagingPanel';
import {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
  CheckboxField,
  RefMultiSelect,
  OrderedRefList,
  RepeatSection,
  CollapsibleRow,
  TagListInput,
  FieldWrap } from
'../../components/fields/Fields';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];

interface RefOption {
  value: string;
  label: string;
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
  meals: string[];
  transport: string;
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
  days: { dayNumber: number; date?: string; title: string; schedule: string; destinations?: { _id: string; name: string }[]; activities?: { _id: string; name: string }[]; customDestinations?: string[]; customActivities?: string[]; hotel?: { _id: string; name: string }; roomType?: string; numberOfRooms?: number; meals: string[]; transport: string; arrivalTime?: string; departureTime?: string; travelTime?: string; notes: string }[];
  hotels: { _id: string; name: string }[];
  tourGuide?: { _id: string; name: string };
  vehicle?: { _id: string; name: string };
  pricing: { basePrice: number; discount: number; totalPrice: number; currency: string; pricePerPerson: boolean };
  adminNotes: string;
  customerFacingNotes: string;
  status: string;
  version: number;
  versionHistory: ItineraryVersion[];
}

interface RequestDetail {
  _id: string;
  referenceNumber: string;
  customer?: { user?: { fullName?: string; email?: string; phone?: string } };
  travelDates: { startDate: string; endDate: string; isFlexible: boolean };
  travelers: { adults: number; children: number; infants: number };
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
  specialRequests: string;
  status: string;
  priority: string;
  assignedAdmin?: string;
  itinerary?: ItineraryDetail;
  revisionHistory: { action: string; note: string; at: string }[];
}

const makeKey = () => Math.random().toString(36).slice(2);

const emptyDay = (n: number): ItineraryDayForm => ({
  _key: makeKey(), dayNumber: n, date: '', title: '', schedule: '', destinations: [], activities: [], customDestinations: [], customActivities: [],
  hotel: '', roomType: '', numberOfRooms: 1, meals: [], transport: '',
  arrivalTime: '', departureTime: '', travelTime: '', notes: ''
});

export function AdminCustomRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [sending, setSending] = useState(false);

  const [destOptions, setDestOptions] = useState<RefOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<RefOption[]>([]);
  const [hotelOptions, setHotelOptions] = useState<RefOption[]>([]);
  const [guideOptions, setGuideOptions] = useState<RefOption[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<RefOption[]>([]);

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
  const [adminNotes, setAdminNotes] = useState('');
  const [customerFacingNotes, setCustomerFacingNotes] = useState('');

  const [routeLegs, setRouteLegs] = useState<RouteLeg[]>([]);
  const [legDeparture, setLegDeparture] = useState('');
  const [legArrival, setLegArrival] = useState('');
  const [legFromDate, setLegFromDate] = useState('');
  const [legToDate, setLegToDate] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [generatingQuotation, setGeneratingQuotation] = useState(false);

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
    apiGetList<{ _id: string; name: string }>('/tour-guides', { limit: 100 }),
    apiGetList<{ _id: string; name: string }>('/vehicles', { limit: 100 })]
    ).then(([d, a, h, g, v]) => {
      setDestOptions(d.data.map((x) => ({ value: x._id, label: x.name })));
      setActivityOptions(a.data.map((x) => ({ value: x._id, label: x.name })));
      setHotelOptions(h.data.map((x) => ({ value: x._id, label: x.name })));
      setGuideOptions(g.data.map((x) => ({ value: x._id, label: x.name })));
      setVehicleOptions(v.data.map((x) => ({ value: x._id, label: x.name })));
    });
  }, []);

  useEffect(() => {
    if (!request) return;
    setCurrency(request.estimatedBudget.currency);
    if (request.itinerary && !['Changes Requested', 'Rejected'].includes(request.itinerary.status)) return;
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
        meals: d.meals || [],
        transport: d.transport || '',
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
      setAdminNotes(itin.adminNotes);
      setCustomerFacingNotes(itin.customerFacingNotes);
      setRouteLegs([]);
      setExpandedDays(new Set());
    } else {
      setTitle(`Custom Itinerary for ${request.referenceNumber}`);
      setBasePrice(request.estimatedBudget.amount);
      setTotalPrice(request.estimatedBudget.amount);
      setTourGuide('');
      setVehicle('');
      setRouteLegs([]);
      if (request.roomTypePreference) {
        setDays([{ ...emptyDay(1), roomType: request.roomTypePreference }]);
      }
    }
  }, [request]);

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

  const addRouteLeg = () => {
    if (!legDeparture.trim() || !legArrival.trim() || !legFromDate || !legToDate) {
      toast('Please fill in departure, arrival and both dates.', 'error');
      return;
    }
    if (legToDate < legFromDate) {
      toast('To Date must be on or after From Date.', 'error');
      return;
    }
    const nights = Math.round((new Date(legToDate).getTime() - new Date(legFromDate).getTime()) / 86400000);
    const dayCount = Math.max(nights, 1);
    setDays((prev) => {
      const newDays: ItineraryDayForm[] = [];
      for (let i = 0; i < dayCount; i += 1) {
        const dayNumber = prev.length + newDays.length + 1;
        const date = new Date(legFromDate);
        date.setDate(date.getDate() + i);
        newDays.push({
          ...emptyDay(dayNumber),
          title: i === 0 ? `${legDeparture} → ${legArrival}` : `${legArrival} – Day ${i + 1}`,
          date: date.toISOString().slice(0, 10)
        });
      }
      return [...prev, ...newDays];
    });
    setRouteLegs((prev) => [...prev, { id: makeKey(), departure: legDeparture, arrival: legArrival, fromDate: legFromDate, toDate: legToDate, nights }]);
    setLegDeparture('');
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
        adminNotes,
        customerFacingNotes
      });
      toast('Itinerary sent to customer.');
      load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to send itinerary.', 'error');
    } finally {
      setSending(false);
    }
  };

  const generateQuotation = async () => {
    const itinId = request?.itinerary?._id;
    if (!itinId) return;
    setGeneratingQuotation(true);
    try {
      const result = await apiPost<{ fileUrl: string }>(`/documents/itineraries/${itinId}/quotation`);
      if (result?.fileUrl) {
        window.open(`${API_ORIGIN}${result.fileUrl}`, '_blank');
        toast('Quotation generated.');
      }
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to generate quotation.', 'error');
    } finally {
      setGeneratingQuotation(false);
    }
  };

  if (loading || !request) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  const showBuilder = !request.itinerary || ['Changes Requested', 'Rejected'].includes(request.itinerary.status);

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
              <div className="flex justify-between"><dt className="text-forest/50">Travel Dates</dt><dd className="text-forest">{new Date(request.travelDates.startDate).toLocaleDateString()} – {new Date(request.travelDates.endDate).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-forest/50">Travelers</dt><dd className="text-forest">{request.travelers.adults} Adults, {request.travelers.children} Children</dd></div>
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
                  <button type="button" onClick={generateQuotation} disabled={generatingQuotation} className="flex items-center gap-1.5 rounded-full border border-forest/15 px-3.5 py-1.5 text-xs font-semibold text-forest hover:bg-cream disabled:opacity-60">
                    {generatingQuotation ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <DownloadIcon className="h-3.5 w-3.5" />} Generate Quotation
                  </button>
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
              <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-4">
                <span className="text-sm text-forest/60">Total Price</span>
                <span className="font-display text-xl font-semibold text-forest">{request.itinerary.pricing.currency} {request.itinerary.pricing.totalPrice.toLocaleString()}</span>
              </div>
            </div> :

          <form onSubmit={sendItinerary} className="space-y-6">
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
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-display text-sm font-semibold text-forest">Itinerary Builder</p>
                  {request.itinerary?._id &&
                <button type="button" onClick={generateQuotation} disabled={generatingQuotation} className="flex items-center gap-1.5 rounded-full border border-forest/15 px-3.5 py-1.5 text-xs font-semibold text-forest hover:bg-cream disabled:opacity-60">
                      {generatingQuotation ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <DownloadIcon className="h-3.5 w-3.5" />} Generate Quotation
                    </button>
                }
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Title" value={title} onChange={setTitle} required minLength={3} />
                  <RefMultiSelect label="Hotels Used" options={hotelOptions} value={hotels} onChange={setHotels} />
                </div>
                <div className="mt-4">
                  <TextAreaField label="Summary" value={summary} onChange={setSummary} rows={2} />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <p className="mb-1 font-display text-sm font-semibold text-forest">Route Builder</p>
                <p className="mb-4 text-xs text-forest/50">Quickly lay out the day-by-day route — each leg you add creates the matching day cards below, ready to fill in one by one.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
                  <TextField label="Departure Destination" value={legDeparture} onChange={setLegDeparture} placeholder="e.g. Colombo Airport" />
                  <TextField label="Arrival Destination" value={legArrival} onChange={setLegArrival} placeholder="e.g. Sigiriya" />
                  <TextField label="From Date" type="date" value={legFromDate} onChange={setLegFromDate} />
                  <TextField label="To Date" type="date" value={legToDate} onChange={setLegToDate} />
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
                        <SelectField label="Hotel" value={day.hotel} onChange={(v) => updateDay(i, { hotel: v })} options={[{ label: 'None', value: '' }, ...hotelOptions]} />
                        <TextField label="Room Type" value={day.roomType} onChange={(v) => updateDay(i, { roomType: v })} placeholder="e.g. Deluxe Double" />
                        <NumberField label="Number of Rooms" value={day.numberOfRooms} onChange={(v) => updateDay(i, { numberOfRooms: v })} min={1} />
                        <div className="sm:col-span-2">
                          <TextAreaField label="Schedule" value={day.schedule} onChange={(v) => updateDay(i, { schedule: v })} rows={2} required minLength={5} />
                        </div>
                        <OrderedRefList label="Destinations (in visit order)" options={destOptions} value={day.destinations} onChange={(v) => updateDay(i, { destinations: v })} />
                        <OrderedRefList label="Activities (in visit order)" options={activityOptions} value={day.activities} onChange={(v) => updateDay(i, { activities: v })} />
                        <TagListInput label="+ Add Custom Destination" value={day.customDestinations} onChange={(v) => updateDay(i, { customDestinations: v })} />
                        <TagListInput label="+ Add Custom Activity" value={day.customActivities} onChange={(v) => updateDay(i, { customActivities: v })} />
                        <TextField label="Transport" value={day.transport} onChange={(v) => updateDay(i, { transport: v })} />
                        <TextField label="Travel Time" value={day.travelTime} onChange={(v) => updateDay(i, { travelTime: v })} placeholder="e.g. 2h 30m to next stop" />
                        <TextField label="Arrival Time" value={day.arrivalTime} onChange={(v) => updateDay(i, { arrivalTime: v })} placeholder="e.g. 10:00 AM" />
                        <TextField label="Departure Time" value={day.departureTime} onChange={(v) => updateDay(i, { departureTime: v })} placeholder="e.g. 8:00 AM" />
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
    </div>);

}
