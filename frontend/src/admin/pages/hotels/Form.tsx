import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon, TrashIcon } from 'lucide-react';
import { apiGetList, apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, NumberField, SelectField, CheckboxField, ImageUploader, RepeatSection } from '../../components/fields/Fields';
import { TranslatedInput, TranslatedTextarea, TranslatedTagListInput, emptyLocalizedString, type LocalizedString } from '../../components/fields/TranslatedFields';

const CATEGORY_OPTIONS = ['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort'];
const MEAL_PLAN_OPTIONS = ['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive'];

interface RoomType {
  name: LocalizedString;
  maxOccupancy: number;
  pricePerNight: number;
  amenities: LocalizedString[];
}

interface HotelDetail {
  name: LocalizedString;
  category: string;
  starRating: number;
  destination?: { _id: string };
  address: LocalizedString;
  description: LocalizedString;
  images: string[];
  amenities: LocalizedString[];
  roomTypes: RoomType[];
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  isPartner: boolean;
  status: string;
}

const emptyRoomType = (): RoomType => ({ name: emptyLocalizedString(), maxOccupancy: 2, pricePerNight: 0, amenities: [] });

export function AdminHotelForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [destOptions, setDestOptions] = useState<{ value: string; label: string }[]>([]);

  const [name, setName] = useState<LocalizedString>(emptyLocalizedString());
  const [category, setCategory] = useState('Standard');
  const [starRating, setStarRating] = useState(3);
  const [destination, setDestination] = useState('');
  const [address, setAddress] = useState<LocalizedString>(emptyLocalizedString());
  const [description, setDescription] = useState<LocalizedString>(emptyLocalizedString());
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<LocalizedString[]>([]);
  const [mealPlans, setMealPlans] = useState<string[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([emptyRoomType()]);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isPartner, setIsPartner] = useState(true);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    apiGetList<{ _id: string; name: string }>('/destinations', { limit: 100 }).then(({ data }) => {
      setDestOptions(data.map((d) => ({ value: d._id, label: d.name })));
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<HotelDetail>(`/hotels/${id}`, { raw: true }).
    then((h) => {
      setName(h.name);
      setCategory(h.category);
      setStarRating(h.starRating);
      setDestination(h.destination?._id || '');
      setAddress(h.address);
      setDescription(h.description);
      setImages(h.images || []);
      const known = new Set(MEAL_PLAN_OPTIONS);
      setAmenities((h.amenities || []).filter((a) => !known.has(a.en)));
      setMealPlans((h.amenities || []).filter((a) => known.has(a.en)).map((a) => a.en));
      setRoomTypes(h.roomTypes?.length ? h.roomTypes : [emptyRoomType()]);
      setContactPerson(h.contactPerson || '');
      setContactPhone(h.contactPhone || '');
      setContactEmail(h.contactEmail || '');
      setIsPartner(h.isPartner);
      setStatus(h.status);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const updateRoomType = (index: number, patch: Partial<RoomType>) => {
    setRoomTypes((prev) => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      category,
      starRating,
      destination,
      address,
      description,
      images,
      amenities: [...amenities, ...mealPlans.map((m) => ({ en: m, de: '', fr: '' }))],
      roomTypes,
      contactPerson,
      contactPhone,
      contactEmail,
      isPartner,
      status
    };
    try {
      if (isEdit) {
        await apiPatch(`/hotels/${id}`, payload);
        toast('Hotel updated.');
      } else {
        await apiPost('/hotels', payload);
        toast('Hotel created.');
      }
      navigate('/admin/hotels');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save hotel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Hotel' : 'Add Hotel'} subtitle="Partner accommodation details, rooms and meal plans" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Basics</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TranslatedInput label="Hotel Name" value={name} onChange={setName} required />
            <SelectField label="Destination" value={destination} onChange={setDestination} options={[{ label: 'Select destination', value: '' }, ...destOptions]} required />
            <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))} />
            <NumberField label="Star Rating" value={starRating} onChange={setStarRating} min={1} step={1} />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
            <TranslatedInput label="Address" value={address} onChange={setAddress} required />
          </div>
          <div className="mt-4">
            <TranslatedTextarea label="Description" value={description} onChange={setDescription} required />
          </div>
          <div className="mt-4">
            <CheckboxField label="Partner hotel" checked={isPartner} onChange={setIsPartner} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Media &amp; Amenities</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Gallery" value={images} onChange={setImages} />
            <div className="space-y-4">
              <TranslatedTagListInput label="Amenities" value={amenities} onChange={setAmenities} />
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-forest/60">Meal Plans</p>
                <div className="flex flex-wrap gap-2">
                  {MEAL_PLAN_OPTIONS.map((m) =>
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealPlans((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    mealPlans.includes(m) ? 'border-emerald bg-emerald/10 text-emerald' : 'border-forest/15 text-forest/60 hover:bg-cream'}`
                    }>

                      {m}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <RepeatSection label="Room Types" onAdd={() => setRoomTypes((prev) => [...prev, emptyRoomType()])} addLabel="Add Room Type">
            {roomTypes.map((r, i) =>
            <div key={i} className="rounded-xl border border-forest/10 p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <TranslatedInput label="Room Name" value={r.name} onChange={(v) => updateRoomType(i, { name: v })} />
                  <NumberField label="Max Occupancy" value={r.maxOccupancy} onChange={(v) => updateRoomType(i, { maxOccupancy: v })} min={1} />
                  <NumberField label="Price / Night (USD)" value={r.pricePerNight} onChange={(v) => updateRoomType(i, { pricePerNight: v })} min={0} />
                  <div className="flex items-end">
                    {roomTypes.length > 1 &&
                  <button type="button" onClick={() => setRoomTypes((prev) => prev.filter((_, idx) => idx !== i))} className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700">
                        <TrashIcon className="h-3.5 w-3.5" /> Remove
                      </button>
                  }
                  </div>
                  <div className="sm:col-span-4">
                    <TranslatedTagListInput label="Room Amenities" value={r.amenities} onChange={(v) => updateRoomType(i, { amenities: v })} />
                  </div>
                </div>
              </div>
            )}
          </RepeatSection>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Contact</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Contact Person" value={contactPerson} onChange={setContactPerson} />
            <TextField label="Phone" value={contactPhone} onChange={setContactPhone} />
            <TextField label="Email" value={contactEmail} onChange={setContactEmail} type="email" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/hotels')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Hotel'}
          </button>
        </div>
      </form>
    </div>);

}
