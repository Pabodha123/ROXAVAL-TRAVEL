import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiGetList, apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, NumberField, SelectField } from '../../components/fields/Fields';

const TYPE_OPTIONS = ['Private (PVT)', 'Seat-in-Coach (SIC)'];

interface TransferDetail {
  name: string;
  destination?: { _id: string };
  supplier: string;
  type: string;
  transferFor: string;
  vehicle?: { _id: string };
  costWithDriver: number;
  costWithoutDriver: number;
  currency: string;
  status: string;
}

export function AdminTransferForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [destOptions, setDestOptions] = useState<{ value: string; label: string }[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<{ value: string; label: string }[]>([]);

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [supplier, setSupplier] = useState('');
  const [type, setType] = useState('Private (PVT)');
  const [transferFor, setTransferFor] = useState('Same Day');
  const [vehicle, setVehicle] = useState('');
  const [costWithDriver, setCostWithDriver] = useState(0);
  const [costWithoutDriver, setCostWithoutDriver] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    Promise.all([
    apiGetList<{ _id: string; name: string }>('/destinations', { limit: 100 }),
    apiGetList<{ _id: string; name: string }>('/vehicles', { limit: 100 })]
    ).then(([dest, veh]) => {
      setDestOptions(dest.data.map((d) => ({ value: d._id, label: d.name })));
      setVehicleOptions(veh.data.map((v) => ({ value: v._id, label: v.name })));
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<TransferDetail>(`/transfers/${id}`).
    then((t) => {
      setName(t.name);
      setDestination(t.destination?._id || '');
      setSupplier(t.supplier || '');
      setType(t.type);
      setTransferFor(t.transferFor || 'Same Day');
      setVehicle(t.vehicle?._id || '');
      setCostWithDriver(t.costWithDriver);
      setCostWithoutDriver(t.costWithoutDriver || 0);
      setCurrency(t.currency || 'USD');
      setStatus(t.status);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      destination,
      supplier,
      type,
      transferFor,
      vehicle: vehicle || undefined,
      costWithDriver,
      costWithoutDriver,
      currency,
      status
    };
    try {
      if (isEdit) {
        await apiPatch(`/transfers/${id}`, payload);
        toast('Transfer updated.');
      } else {
        await apiPost('/transfers', payload);
        toast('Transfer created.');
      }
      navigate('/admin/transfers');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save transfer.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Transfer' : 'Add Transfer'} subtitle="Point-to-point transfer cost used by the itinerary builder" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Basics</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Transfer Name" value={name} onChange={setName} placeholder="e.g. Airport to Hotel" required />
            <SelectField label="Destination" value={destination} onChange={setDestination} options={[{ label: 'Select destination', value: '' }, ...destOptions]} required />
            <TextField label="Supplier" value={supplier} onChange={setSupplier} placeholder="e.g. Gamini Gems" />
            <SelectField label="Type" value={type} onChange={setType} options={TYPE_OPTIONS.map((t) => ({ label: t, value: t }))} />
            <TextField label="Transfer For" value={transferFor} onChange={setTransferFor} placeholder="e.g. Same Day, Arrival, Departure" />
            <SelectField label="Vehicle" value={vehicle} onChange={setVehicle} options={[{ label: 'Select vehicle', value: '' }, ...vehicleOptions]} />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Pricing</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Currency" value={currency} onChange={setCurrency} />
            <NumberField label="Cost With Driver" value={costWithDriver} onChange={setCostWithDriver} min={0} required />
            <NumberField label="Cost Without Driver" value={costWithoutDriver} onChange={setCostWithoutDriver} min={0} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/transfers')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Transfer'}
          </button>
        </div>
      </form>
    </div>);

}
