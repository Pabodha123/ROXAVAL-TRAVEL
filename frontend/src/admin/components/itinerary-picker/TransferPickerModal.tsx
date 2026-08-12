import React, { useEffect, useState } from 'react';
import { Loader2Icon, SearchIcon } from 'lucide-react';
import { apiGetList } from '../../../lib/api';
import { Modal } from '../Modal';

export interface TransferSelection {
  transfer: string;
  name: string;
  withDriver: boolean;
  vehicleCount: number;
  cost: number;
}

interface TransferRow {
  _id: string;
  name: string;
  supplier: string;
  type: string;
  vehicle?: { _id: string; name: string };
  costWithDriver: number;
  costWithoutDriver: number;
  currency: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  destinationOptions: { value: string; label: string }[];
  defaultDestination?: string;
  onAdd: (selection: TransferSelection) => void;
}

export function TransferPickerModal({ open, onClose, destinationOptions, defaultDestination, onAdd }: Props) {
  const [destination, setDestination] = useState(defaultDestination || '');
  const [search, setSearch] = useState('');
  const [transfers, setTransfers] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [pickedTransfer, setPickedTransfer] = useState<TransferRow | null>(null);
  const [withDriver, setWithDriver] = useState(true);
  const [vehicleCount, setVehicleCount] = useState(1);

  useEffect(() => {
    if (!open) return;
    setDestination(defaultDestination || '');
    setPickedTransfer(null);
    setWithDriver(true);
    setVehicleCount(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDestination]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params: Record<string, string | number | undefined> = { limit: 50 };
    if (destination) params.destination = destination;
    if (search) params.q = search;
    apiGetList<TransferRow>('/transfers', params).
    then(({ data }) => setTransfers(data)).
    finally(() => setLoading(false));
  }, [open, destination, search]);

  const pick = (t: TransferRow) => {
    setPickedTransfer(t);
    setWithDriver(true);
    setVehicleCount(1);
  };

  const unitCost = pickedTransfer ? withDriver ? pickedTransfer.costWithDriver : pickedTransfer.costWithoutDriver : 0;
  const totalCost = unitCost * vehicleCount;

  const confirm = () => {
    if (!pickedTransfer) return;
    onAdd({ transfer: pickedTransfer._id, name: pickedTransfer.name, withDriver, vehicleCount, cost: totalCost });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Select Transfer" maxWidth="max-w-3xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Destinations</option>
          {destinationOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or supplier…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald" />
        </div>
      </div>

      <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-forest/10">
        {loading ?
        <div className="grid h-32 place-items-center"><Loader2Icon className="h-5 w-5 animate-spin text-forest/40" /></div> :

        <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream">
              <tr className="text-forest/50">
                <th className="p-2 font-semibold">Transfer</th>
                <th className="p-2 font-semibold">Supplier</th>
                <th className="p-2 font-semibold">Vehicle</th>
                <th className="p-2 font-semibold">Type</th>
                <th className="p-2 text-right font-semibold">Cost (w/ driver)</th>
                <th className="p-2 text-right font-semibold">Cost (w/o driver)</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) =>
            <tr key={t._id} className={`border-t border-forest/5 ${pickedTransfer?._id === t._id ? 'bg-emerald/10' : ''}`}>
                  <td className="p-2 text-forest">{t.name}</td>
                  <td className="p-2 text-forest/60">{t.supplier || '-'}</td>
                  <td className="p-2 text-forest/60">{t.vehicle?.name || '-'}</td>
                  <td className="p-2 text-forest/60">{t.type}</td>
                  <td className="p-2 text-right text-forest/70">{t.currency} {t.costWithDriver}</td>
                  <td className="p-2 text-right text-forest/70">{t.currency} {t.costWithoutDriver}</td>
                  <td className="p-2 text-right">
                    <button type="button" onClick={() => pick(t)} className="rounded-full bg-forest px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald">Select</button>
                  </td>
                </tr>
            )}
              {!loading && transfers.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-forest/40">No transfers match these filters.</td></tr>}
            </tbody>
          </table>
        }
      </div>

      {pickedTransfer &&
      <div className="mt-4 rounded-xl border border-emerald/20 bg-emerald/5 p-4">
          <p className="text-sm font-semibold text-forest">{pickedTransfer.name}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-forest">
              <input type="checkbox" checked={withDriver} onChange={(e) => setWithDriver(e.target.checked)} className="h-4 w-4 rounded border-forest/30 text-emerald focus:ring-emerald" />
              With Driver
            </label>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-forest/50">No. of Vehicles</label>
              <input type="number" min={1} value={vehicleCount} onChange={(e) => setVehicleCount(Math.max(1, Number(e.target.value) || 1))} className="w-full rounded-lg border border-forest/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-emerald" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-forest">Total: {pickedTransfer.currency} {totalCost.toLocaleString()}</p>
            <button type="button" onClick={confirm} className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-light">Add Transfer</button>
          </div>
        </div>
      }
    </Modal>);

}
