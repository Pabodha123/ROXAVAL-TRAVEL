import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, PlusIcon, SaveIcon, TrashIcon } from 'lucide-react';
import { apiDelete, apiGetList, apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, TextAreaField, NumberField, SelectField, CheckboxField, ImageUploader, TagListInput, RefMultiSelect, RepeatSection } from '../../components/fields/Fields';

const REGION_OPTIONS = ['Cultural Triangle', 'Hill Country', 'Tea Country', 'Wildlife', 'South Coast', 'West Coast', 'North', 'East'];
const CATEGORY_OPTIONS = ['Cultural', 'Wildlife', 'Beach', 'Hill Country', 'City', 'Nature', 'Adventure'];

interface Attraction {
  _id?: string;
  name: string;
  description: string;
  images: string[];
  bestVisitingMonths: string[];
  estimatedVisitDuration: string;
  googleMapsLink: string;
  travelTips: string[];
  entryFee: number;
}

interface DestinationDetail {
  name: string;
  region?: string;
  tag: string;
  description: string;
  heroImage: string;
  gallery: string[];
  isFeatured: boolean;
  status: string;
  attractions: Attraction[];
  history: string;
  whyVisit: string[];
  popularActivities: string[];
  bestTimeToVisit: string;
  openingHours: string;
  entranceFee: { amount: number; currency: string; notes: string };
  travelTips: string[];
  nearbyDestinations: { _id: string }[];
  mapLocation?: { lat: number; lng: number };
}

interface DestinationOption {
  _id: string;
  name: string;
}

const emptyAttraction = (): Attraction => ({ name: '', description: '', images: [], bestVisitingMonths: [], estimatedVisitDuration: '', googleMapsLink: '', travelTips: [], entryFee: 0 });

export function AdminDestinationForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [tag, setTag] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [heroImage, setHeroImage] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('draft');
  const [attractions, setAttractions] = useState<Attraction[]>([]);

  const [history, setHistory] = useState('');
  const [whyVisit, setWhyVisit] = useState<string[]>([]);
  const [popularActivities, setPopularActivities] = useState<string[]>([]);
  const [bestTimeToVisit, setBestTimeToVisit] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [entranceFeeAmount, setEntranceFeeAmount] = useState(0);
  const [entranceFeeCurrency, setEntranceFeeCurrency] = useState('USD');
  const [entranceFeeNotes, setEntranceFeeNotes] = useState('');
  const [travelTips, setTravelTips] = useState<string[]>([]);
  const [nearbyDestinations, setNearbyDestinations] = useState<string[]>([]);
  const [mapLat, setMapLat] = useState(0);
  const [mapLng, setMapLng] = useState(0);

  const [destinationOptions, setDestinationOptions] = useState<DestinationOption[]>([]);

  useEffect(() => {
    apiGetList<DestinationOption>('/destinations/admin/all', { limit: 200 }).
    then(({ data }) => setDestinationOptions(data.filter((d) => d._id !== id)));
  }, [id]);

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<DestinationDetail>(`/destinations/${id}`).
    then((d) => {
      setName(d.name);
      setRegion(d.region || REGION_OPTIONS[0]);
      setTag(d.tag || CATEGORY_OPTIONS[0]);
      setDescription(d.description);
      setHeroImage(d.heroImage ? [d.heroImage] : []);
      setGallery(d.gallery || []);
      setIsFeatured(d.isFeatured);
      setStatus(d.status);
      setAttractions(d.attractions || []);
      setHistory(d.history || '');
      setWhyVisit(d.whyVisit || []);
      setPopularActivities(d.popularActivities || []);
      setBestTimeToVisit(d.bestTimeToVisit || '');
      setOpeningHours(d.openingHours || '');
      setEntranceFeeAmount(d.entranceFee?.amount || 0);
      setEntranceFeeCurrency(d.entranceFee?.currency || 'USD');
      setEntranceFeeNotes(d.entranceFee?.notes || '');
      setTravelTips(d.travelTips || []);
      setNearbyDestinations((d.nearbyDestinations || []).map((n) => n._id));
      setMapLat(d.mapLocation?.lat || 0);
      setMapLng(d.mapLocation?.lng || 0);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name, region, tag, description, heroImage: heroImage[0] || '', gallery, isFeatured, status,
      history, whyVisit, popularActivities, bestTimeToVisit, openingHours,
      entranceFee: { amount: entranceFeeAmount, currency: entranceFeeCurrency, notes: entranceFeeNotes },
      travelTips, nearbyDestinations,
      mapLocation: mapLat || mapLng ? { lat: mapLat, lng: mapLng } : undefined
    };
    try {
      if (isEdit) {
        await apiPatch(`/destinations/${id}`, payload);
        toast('Destination updated.');
      } else {
        await apiPost('/destinations', payload);
        toast('Destination created.');
      }
      navigate('/admin/destinations');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save destination.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addAttraction = async () => {
    if (!isEdit) return;
    try {
      const doc = await apiPost<DestinationDetail>(`/destinations/${id}/attractions`, emptyAttraction());
      setAttractions(doc.attractions);
      toast('Attraction added.');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to add attraction.', 'error');
    }
  };

  const saveAttraction = async (attraction: Attraction) => {
    if (!isEdit || !attraction._id) return;
    try {
      await apiPatch(`/destinations/${id}/attractions/${attraction._id}`, attraction);
      toast('Attraction saved.');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save attraction.', 'error');
    }
  };

  const removeAttraction = async (attractionId?: string) => {
    if (!isEdit || !attractionId) return;
    try {
      await apiDelete(`/destinations/${id}/attractions/${attractionId}`);
      setAttractions((prev) => prev.filter((a) => a._id !== attractionId));
      toast('Attraction removed.');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to remove attraction.', 'error');
    }
  };

  const updateAttraction = (index: number, patch: Partial<Attraction>) => {
    setAttractions((prev) => prev.map((a, i) => i === index ? { ...a, ...patch } : a));
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Destination' : 'Add Destination'} subtitle="Where in Sri Lanka should travelers go?" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Basics</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={name} onChange={setName} required />
            <SelectField label="Category" value={tag} onChange={setTag} options={CATEGORY_OPTIONS.map((r) => ({ label: r, value: r }))} />
            <SelectField label="Region" value={region} onChange={setRegion} options={REGION_OPTIONS.map((r) => ({ label: r, value: r }))} />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }]} />
          </div>
          <div className="mt-4">
            <TextAreaField label="Description" value={description} onChange={setDescription} required />
          </div>
          <div className="mt-4">
            <CheckboxField label="Feature on homepage" checked={isFeatured} onChange={setIsFeatured} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Media</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Hero Image" value={heroImage} onChange={setHeroImage} multiple={false} />
            <ImageUploader label="Gallery" value={gallery} onChange={setGallery} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Detail Page Content</p>
          <div className="grid gap-4">
            <TextAreaField label="History" value={history} onChange={setHistory} rows={3} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TagListInput label="Why Visit" value={whyVisit} onChange={setWhyVisit} placeholder="Add a reason and press Enter" />
              <TagListInput label="Popular Activities" value={popularActivities} onChange={setPopularActivities} placeholder="Add an activity and press Enter" />
            </div>
            <TagListInput label="Travel Tips" value={travelTips} onChange={setTravelTips} placeholder="Add a tip and press Enter" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Visit Info</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Best Time to Visit" value={bestTimeToVisit} onChange={setBestTimeToVisit} placeholder="e.g. December to April" />
            <TextField label="Opening Hours" value={openingHours} onChange={setOpeningHours} placeholder="e.g. 6:00 AM – 6:00 PM" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <NumberField label="Entrance Fee Amount" value={entranceFeeAmount} onChange={setEntranceFeeAmount} min={0} />
            <TextField label="Entrance Fee Currency" value={entranceFeeCurrency} onChange={setEntranceFeeCurrency} />
            <TextField label="Entrance Fee Notes" value={entranceFeeNotes} onChange={setEntranceFeeNotes} placeholder="e.g. Foreigners only" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label="Map Latitude" value={mapLat} onChange={setMapLat} step={0.0001} />
            <NumberField label="Map Longitude" value={mapLng} onChange={setMapLng} step={0.0001} />
          </div>
          <div className="mt-4">
            <RefMultiSelect label="Nearby Destinations" options={destinationOptions.map((o) => ({ label: o.name, value: o._id }))} value={nearbyDestinations} onChange={setNearbyDestinations} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/destinations')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Destination'}
          </button>
        </div>
      </form>

      {isEdit ?
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
          <RepeatSection label="Attractions" onAdd={addAttraction} addLabel="Add Attraction">
            {attractions.length === 0 && <p className="text-sm text-forest/40">No attractions added yet.</p>}
            {attractions.map((a, i) =>
          <div key={a._id || i} className="rounded-xl border border-forest/10 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Name" value={a.name} onChange={(v) => updateAttraction(i, { name: v })} />
                  <TextField label="Google Maps Link" value={a.googleMapsLink} onChange={(v) => updateAttraction(i, { googleMapsLink: v })} />
                  <div className="sm:col-span-2">
                    <TextAreaField label="Description" value={a.description} onChange={(v) => updateAttraction(i, { description: v })} rows={2} />
                  </div>
                  <TextField label="Estimated Visit Duration" value={a.estimatedVisitDuration} onChange={(v) => updateAttraction(i, { estimatedVisitDuration: v })} placeholder="e.g. 2-3 hours" />
                  <NumberField label="Entry Fee (USD)" value={a.entryFee} onChange={(v) => updateAttraction(i, { entryFee: v })} min={0} />
                  <TagListInput label="Best Visiting Months" value={a.bestVisitingMonths} onChange={(v) => updateAttraction(i, { bestVisitingMonths: v })} />
                  <TagListInput label="Travel Tips" value={a.travelTips} onChange={(v) => updateAttraction(i, { travelTips: v })} />
                  <div className="sm:col-span-2">
                    <ImageUploader label="Images" value={a.images} onChange={(v) => updateAttraction(i, { images: v })} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => removeAttraction(a._id)} className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                    <TrashIcon className="h-3.5 w-3.5" /> Remove
                  </button>
                  <button type="button" onClick={() => saveAttraction(a)} className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream hover:bg-emerald">
                    <SaveIcon className="h-3.5 w-3.5" /> Save Attraction
                  </button>
                </div>
              </div>
          )}
          </RepeatSection>
        </div> :

      <p className="mt-4 flex items-center gap-1.5 text-xs text-forest/40"><PlusIcon className="h-3.5 w-3.5" /> Save this destination first to add attractions.</p>
      }
    </div>);

}
