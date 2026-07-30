import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, NumberField, SelectField, CheckboxField, TagListInput, ImageUploader } from '../../components/fields/Fields';

const TYPE_OPTIONS = ['Car', 'Van', 'SUV', 'Minibus', 'Bus'];

interface VehicleDetail {
  name: string;
  type: string;
  capacity: number;
  driverIncluded: boolean;
  features: string[];
  images: string[];
  pricePerDay: number;
  status: string;
}

export function AdminVehicleForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('Car');
  const [capacity, setCapacity] = useState(4);
  const [driverIncluded, setDriverIncluded] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [pricePerDay, setPricePerDay] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<VehicleDetail>(`/vehicles/${id}`).
    then((v) => {
      setName(v.name);
      setType(v.type);
      setCapacity(v.capacity);
      setDriverIncluded(v.driverIncluded);
      setFeatures(v.features || []);
      setImages(v.images || []);
      setPricePerDay(v.pricePerDay);
      setStatus(v.status);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, type, capacity, driverIncluded, features, images, pricePerDay, status };
    try {
      if (isEdit) {
        await apiPatch(`/vehicles/${id}`, payload);
        toast('Vehicle updated.');
      } else {
        await apiPost('/vehicles', payload);
        toast('Vehicle created.');
      }
      navigate('/admin/vehicles');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save vehicle.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'} subtitle="Transport fleet details for custom itinerary assignment" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Basics</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Vehicle Name" value={name} onChange={setName} required />
            <SelectField label="Type" value={type} onChange={setType} options={TYPE_OPTIONS.map((t) => ({ label: t, value: t }))} />
            <NumberField label="Passenger Capacity" value={capacity} onChange={setCapacity} min={1} required />
            <NumberField label="Price / Day (USD)" value={pricePerDay} onChange={setPricePerDay} min={0} required />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
          </div>
          <div className="mt-4">
            <CheckboxField label="Driver included" checked={driverIncluded} onChange={setDriverIncluded} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Photos &amp; Features</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Photos" value={images} onChange={setImages} />
            <TagListInput label="Features" value={features} onChange={setFeatures} placeholder="e.g. Air conditioning" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/vehicles')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Vehicle'}
          </button>
        </div>
      </form>
    </div>);

}
