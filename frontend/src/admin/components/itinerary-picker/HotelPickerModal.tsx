import React, { useEffect, useState } from 'react';
import { Loader2Icon, SearchIcon } from 'lucide-react';
import { apiGetList } from '../../../lib/api';
import { Modal } from '../Modal';

export interface RoomOccupancy {
  single: number;
  double: number;
  triple: number;
  quad: number;
  extraBed: number;
  childWithBed: number;
  childNoBed: number;
  infant: number;
}

export interface HotelSelection {
  hotel: string;
  hotelName: string;
  roomType: string;
  numberOfRooms: number;
  roomOccupancy: RoomOccupancy;
  roomCost: number;
}

interface SeasonalRate {
  validFrom: string;
  validTo: string;
  currency?: string;
  pricing: RoomOccupancy;
}

interface RoomTypeRow {
  _id: string;
  name: string;
  mealPlan?: string;
  maxOccupancy: number;
  pricing?: RoomOccupancy;
  seasonalRates?: SeasonalRate[];
}

interface HotelRow {
  _id: string;
  name: string;
  starRating: number;
  destination?: { _id: string; name: string };
  roomTypes: RoomTypeRow[];
}

const emptyOccupancy = (): RoomOccupancy => ({ single: 0, double: 0, triple: 0, quad: 0, extraBed: 0, childWithBed: 0, childNoBed: 0, infant: 0 });

const OCCUPANCY_FIELDS: { key: keyof RoomOccupancy; label: string }[] = [
{ key: 'single', label: 'SGL' },
{ key: 'double', label: 'DBL' },
{ key: 'triple', label: 'TRPL' },
{ key: 'quad', label: 'QUAD' },
{ key: 'extraBed', label: 'Extra Bed' },
{ key: 'childWithBed', label: 'Child w/ Bed' },
{ key: 'childNoBed', label: 'Child no Bed' },
{ key: 'infant', label: 'Infant' }];


const MEAL_PLAN_OPTIONS = ['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive'];

// Picks the seasonal rate period covering `travelDate`, falling back to the
// room type's default `pricing` when no period matches (or no date is given).
function resolveRate(rt: RoomTypeRow, travelDate?: string): { pricing: RoomOccupancy; currency: string; seasonal: boolean } {
  if (travelDate && rt.seasonalRates?.length) {
    const d = new Date(travelDate).getTime();
    const match = rt.seasonalRates.find((s) => {
      const from = new Date(s.validFrom).getTime();
      const to = new Date(s.validTo).getTime();
      return d >= from && d <= to;
    });
    if (match) return { pricing: match.pricing, currency: match.currency || 'USD', seasonal: true };
  }
  return { pricing: rt.pricing || emptyOccupancy(), currency: 'USD', seasonal: false };
}

interface Props {
  open: boolean;
  onClose: () => void;
  destinationOptions: { value: string; label: string }[];
  defaultDestination?: string;
  travelDate?: string;
  onConfirm: (selection: HotelSelection) => void;
}

export function HotelPickerModal({ open, onClose, destinationOptions, defaultDestination, travelDate, onConfirm }: Props) {
  const [destination, setDestination] = useState(defaultDestination || '');
  const [starRating, setStarRating] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [search, setSearch] = useState('');
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [pickedHotel, setPickedHotel] = useState<HotelRow | null>(null);
  const [pickedRoomType, setPickedRoomType] = useState<RoomTypeRow | null>(null);
  const [occupancy, setOccupancy] = useState<RoomOccupancy>(emptyOccupancy());

  useEffect(() => {
    if (!open) return;
    setDestination(defaultDestination || '');
    setPickedHotel(null);
    setPickedRoomType(null);
    setOccupancy(emptyOccupancy());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDestination]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params: Record<string, string | number | undefined> = { limit: 50 };
    if (destination) params.destination = destination;
    if (starRating) params.starRating = starRating;
    if (mealPlan) params['roomTypes.mealPlan'] = mealPlan;
    if (search) params.q = search;
    apiGetList<HotelRow>('/hotels', params).
    then(({ data }) => setHotels(data)).
    finally(() => setLoading(false));
  }, [open, destination, starRating, mealPlan, search]);

  const selectRoomType = (hotel: HotelRow, rt: RoomTypeRow) => {
    setPickedHotel(hotel);
    setPickedRoomType(rt);
    setOccupancy(emptyOccupancy());
  };

  const resolved = pickedRoomType ? resolveRate(pickedRoomType, travelDate) : { pricing: emptyOccupancy(), currency: 'USD', seasonal: false };
  const rate = resolved.pricing;
  const subtotal = OCCUPANCY_FIELDS.reduce((sum, f) => sum + occupancy[f.key] * (rate[f.key] || 0), 0);
  const roomCount = occupancy.single + occupancy.double + occupancy.triple + occupancy.quad;

  const confirm = () => {
    if (!pickedHotel || !pickedRoomType || subtotal <= 0) return;
    onConfirm({
      hotel: pickedHotel._id,
      hotelName: pickedHotel.name,
      roomType: pickedRoomType.name,
      numberOfRooms: Math.max(1, roomCount),
      roomOccupancy: occupancy,
      roomCost: subtotal
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Select Hotel & Room" maxWidth="max-w-4xl">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Destinations</option>
          {destinationOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={starRating} onChange={(e) => setStarRating(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Star Ratings</option>
          {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} Star</option>)}
        </select>
        <select value={mealPlan} onChange={(e) => setMealPlan(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Meal Plans</option>
          {MEAL_PLAN_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hotel…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald" />
        </div>
      </div>

      <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-forest/10">
        {loading ?
        <div className="grid h-32 place-items-center"><Loader2Icon className="h-5 w-5 animate-spin text-forest/40" /></div> :

        <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream">
              <tr className="text-forest/50">
                <th className="p-2 font-semibold">Hotel</th>
                <th className="p-2 font-semibold">Room Type</th>
                <th className="p-2 font-semibold">Meal</th>
                {OCCUPANCY_FIELDS.map((f) => <th key={f.key} className="p-2 text-right font-semibold">{f.label}</th>)}
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {hotels.flatMap((h) =>
            (h.roomTypes.length ? h.roomTypes : []).map((rt) => {
              const rowRate = resolveRate(rt, travelDate);
              return (
                <tr key={`${h._id}-${rt._id}`} className={`border-t border-forest/5 ${pickedHotel?._id === h._id && pickedRoomType?._id === rt._id ? 'bg-emerald/10' : ''}`}>
                    <td className="p-2 text-forest">{h.name} {h.starRating ? `(${h.starRating}★)` : ''}</td>
                    <td className="p-2 text-forest">{rt.name}</td>
                    <td className="p-2 text-forest/60">
                      {rt.mealPlan || '-'}
                      {rowRate.seasonal && <span className="ml-1 rounded-full bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" title="Rate for this day's travel date">SEASON</span>}
                      {rowRate.currency !== 'USD' && <span className="ml-1 text-[9px] font-semibold text-forest/40">{rowRate.currency}</span>}
                    </td>
                    {OCCUPANCY_FIELDS.map((f) => <td key={f.key} className="p-2 text-right text-forest/70">{rowRate.pricing[f.key] || 0}</td>)}
                    <td className="p-2 text-right">
                      <button type="button" onClick={() => selectRoomType(h, rt)} className="rounded-full bg-forest px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald">Select</button>
                    </td>
                  </tr>);

            }
            )
            )}
              {!loading && hotels.length === 0 && <tr><td colSpan={10} className="p-4 text-center text-forest/40">No hotels match these filters.</td></tr>}
            </tbody>
          </table>
        }
      </div>

      {pickedHotel && pickedRoomType &&
      <div className="mt-4 rounded-xl border border-emerald/20 bg-emerald/5 p-4">
          <p className="text-sm font-semibold text-forest">{pickedHotel.name} - {pickedRoomType.name}</p>
          <p className="mt-1 text-xs text-forest/50">Set how many of each occupancy type to book for this day.</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OCCUPANCY_FIELDS.map((f) =>
          <div key={f.key}>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-forest/50">{f.label} (${rate[f.key] || 0})</label>
                <input
              type="number"
              min={0}
              value={occupancy[f.key]}
              onChange={(e) => setOccupancy((prev) => ({ ...prev, [f.key]: Number(e.target.value) || 0 }))}
              className="w-full rounded-lg border border-forest/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-emerald" />

              </div>
          )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-forest">Subtotal: ${subtotal.toLocaleString()}</p>
              {subtotal <= 0 &&
              <p className="mt-0.5 text-xs text-red-500">Enter at least one room above to set a cost before confirming.</p>
              }
            </div>
            <button
              type="button"
              onClick={confirm}
              disabled={subtotal <= 0}
              className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-light disabled:cursor-not-allowed disabled:bg-forest/20 disabled:text-forest/40">
              Use this Room
            </button>
          </div>
        </div>
      }
    </Modal>);

}
