import React, { useEffect, useState } from 'react';
import { Loader2Icon, SearchIcon } from 'lucide-react';
import { apiGetList } from '../../../lib/api';
import { Modal } from '../Modal';

export interface ActivitySelection {
  activity: string;
  name: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  cost: number;
}

interface ActivityRow {
  _id: string;
  name: string;
  category: string;
  pricing?: { adult: number; child: number; infant: number };
}

const CATEGORY_OPTIONS = ['Adventure', 'Wildlife', 'Culture', 'Relaxation', 'Scenic', 'Water Sports', 'Nature'];

interface Props {
  open: boolean;
  onClose: () => void;
  destinationOptions: { value: string; label: string }[];
  defaultDestination?: string;
  secondaryDestination?: string;
  travelers: { adults: number; children: number; infants: number };
  selectedIds: string[];
  onAdd: (selection: ActivitySelection) => void;
  onRemove: (activityId: string) => void;
}

export function ActivityPickerModal({ open, onClose, destinationOptions, defaultDestination, secondaryDestination, travelers, selectedIds, onAdd, onRemove }: Props) {
  // Auto-suggested destinations: this day's arrival + the previous day's
  // arrival (e.g. a Sigiriya -> Kandy leg should also surface Sigiriya
  // waypoint activities left over from where the group is travelling from).
  const suggestedDestinations = Array.from(new Set([defaultDestination, secondaryDestination].filter(Boolean))) as string[];
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDestination('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDestination, secondaryDestination]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const activeDestinations = destination ? [destination] : suggestedDestinations;
    const baseParams: Record<string, string | number | undefined> = { limit: 50 };
    if (category) baseParams.category = category;
    if (search) baseParams.q = search;
    const fetches = activeDestinations.length > 0 ?
    activeDestinations.map((d) => apiGetList<ActivityRow>('/activities', { ...baseParams, destinations: d })) :
    [apiGetList<ActivityRow>('/activities', baseParams)];
    Promise.all(fetches).
    then((results) => {
      const merged = new Map<string, ActivityRow>();
      results.forEach(({ data }) => data.forEach((a) => merged.set(a._id, a)));
      setActivities(Array.from(merged.values()));
    }).
    finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, destination, category, search, defaultDestination, secondaryDestination]);

  const costFor = (a: ActivityRow) => {
    const p = a.pricing || { adult: 0, child: 0, infant: 0 };
    return travelers.adults * p.adult + travelers.children * p.child + travelers.infants * p.infant;
  };

  const toggle = (a: ActivityRow) => {
    if (selectedIds.includes(a._id)) {
      onRemove(a._id);
      return;
    }
    onAdd({
      activity: a._id,
      name: a.name,
      adultCount: travelers.adults,
      childCount: travelers.children,
      infantCount: travelers.infants,
      cost: costFor(a)
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Select Sightseeing" maxWidth="max-w-3xl">
      <div className="grid gap-3 sm:grid-cols-3">
        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">{suggestedDestinations.length > 0 ? 'Suggested (this + previous stop)' : 'All Destinations'}</option>
          {destinationOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sightseeing…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald" />
        </div>
      </div>
      {!destination && suggestedDestinations.length > 0 &&
      <p className="mt-2 text-xs text-forest/50">
          Showing sightseeing for {suggestedDestinations.map((id) => destinationOptions.find((d) => d.value === id)?.label || id).join(' and ')}. Pick a destination above to narrow or broaden this list.
        </p>
      }

      <div className="mt-4 max-h-96 overflow-auto rounded-xl border border-forest/10">
        {loading ?
        <div className="grid h-32 place-items-center"><Loader2Icon className="h-5 w-5 animate-spin text-forest/40" /></div> :

        <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream">
              <tr className="text-forest/50">
                <th className="p-2 font-semibold">Sightseeing</th>
                <th className="p-2 font-semibold">Category</th>
                <th className="p-2 text-right font-semibold">Adult ×{travelers.adults}</th>
                <th className="p-2 text-right font-semibold">Child ×{travelers.children}</th>
                <th className="p-2 text-right font-semibold">Infant ×{travelers.infants}</th>
                <th className="p-2 text-right font-semibold">Total</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => {
              const selected = selectedIds.includes(a._id);
              const p = a.pricing || { adult: 0, child: 0, infant: 0 };
              return (
                <tr key={a._id} className={`border-t border-forest/5 ${selected ? 'bg-emerald/10' : ''}`}>
                    <td className="p-2 text-forest">{a.name}</td>
                    <td className="p-2 text-forest/60">{a.category}</td>
                    <td className="p-2 text-right text-forest/70">${p.adult}</td>
                    <td className="p-2 text-right text-forest/70">${p.child}</td>
                    <td className="p-2 text-right text-forest/70">${p.infant}</td>
                    <td className="p-2 text-right font-semibold text-forest">${costFor(a).toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <button
                      type="button"
                      onClick={() => toggle(a)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      selected ? 'bg-emerald text-white' : 'bg-forest text-white hover:bg-emerald'}`
                      }>

                        {selected ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>);

            })}
              {!loading && activities.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-forest/40">No activities match these filters.</td></tr>}
            </tbody>
          </table>
        }
      </div>
    </Modal>);

}
