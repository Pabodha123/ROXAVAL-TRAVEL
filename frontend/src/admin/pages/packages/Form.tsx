import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon, TrashIcon } from 'lucide-react';
import { apiGetList, apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import {
  NumberField,
  SelectField,
  CheckboxField,
  RefMultiSelect,
  ImageUploader,
  RepeatSection,
  FieldWrap } from
'../../components/fields/Fields';
import { TranslatedInput, TranslatedTextarea, TranslatedTagListInput, emptyLocalizedString, type LocalizedString } from '../../components/fields/TranslatedFields';

const CATEGORY_OPTIONS = ['Best Seller', 'Scenic', 'Adventure', 'Relax', 'Luxury', 'Signature', 'Honeymoon', 'Family', 'Wildlife'];
const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];

interface ItineraryDayForm {
  dayNumber: number;
  title: LocalizedString;
  description: LocalizedString;
  destinations: string[];
  activities: string[];
  hotel: string;
  meals: string[];
}

interface RefOption {
  value: string;
  label: string;
}

// Admin edits every language at once, so it fetches/saves the raw {en,de,fr}
// shape (via `?raw=true`) rather than the locale-flattened public shape.
interface AdminTourPackageRaw {
  _id: string;
  name: LocalizedString;
  category: string;
  tourType: string;
  heroImage: string;
  gallery: string[];
  destinations: { _id: string }[];
  activities: { _id: string }[];
  hotels: { _id: string }[];
  durationDays: number;
  durationNights: number;
  itinerary: {
    dayNumber: number;
    title: LocalizedString;
    description: LocalizedString;
    destinations?: { _id: string }[];
    activities?: { _id: string }[];
    hotel?: { _id: string };
    meals?: string[];
  }[];
  includedServices: LocalizedString[];
  excludedServices: LocalizedString[];
  description: LocalizedString;
  highlights: LocalizedString[];
  price: number;
  discountPrice?: number;
  childPricePercent?: number;
  minTravelers: number;
  maxTravelers: number;
  status: string;
  isFeatured: boolean;
}

const emptyDay = (n: number): ItineraryDayForm => ({ dayNumber: n, title: emptyLocalizedString(), description: emptyLocalizedString(), destinations: [], activities: [], hotel: '', meals: [] });

// Keep optional references out of the API payload when they are blank. This
// also creates a stable representation for detecting whether the itinerary
// itself has changed during a media-only package edit.
const serializeItinerary = (days: ItineraryDayForm[]) => JSON.stringify(
  days.map(({ hotel, ...day }) => ({ ...day, ...(hotel ? { hotel } : {}) }))
);

export function AdminPackageForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [destOptions, setDestOptions] = useState<RefOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<RefOption[]>([]);
  const [hotelOptions, setHotelOptions] = useState<RefOption[]>([]);

  const [name, setName] = useState<LocalizedString>(emptyLocalizedString());
  const [category, setCategory] = useState('Best Seller');
  const [tourType, setTourType] = useState('Private');
  const [heroImage, setHeroImage] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [hotels, setHotels] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(1);
  const [durationNights, setDurationNights] = useState(0);
  const [itinerary, setItinerary] = useState<ItineraryDayForm[]>([emptyDay(1)]);
  const [includedServices, setIncludedServices] = useState<LocalizedString[]>([]);
  const [excludedServices, setExcludedServices] = useState<LocalizedString[]>([]);
  const [description, setDescription] = useState<LocalizedString>(emptyLocalizedString());
  const [highlights, setHighlights] = useState<LocalizedString[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [childPricePercent, setChildPricePercent] = useState<number>(50);
  const [minTravelers, setMinTravelers] = useState(1);
  const [maxTravelers, setMaxTravelers] = useState(20);
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const initialItinerary = useRef('');

  useEffect(() => {
    Promise.all([
    apiGetList<{ _id: string; name: string }>('/destinations', { limit: 100 }),
    apiGetList<{ _id: string; name: string }>('/activities', { limit: 100 }),
    apiGetList<{ _id: string; name: string }>('/hotels', { limit: 100 })]
    ).then(([d, a, h]) => {
      setDestOptions(d.data.map((x) => ({ value: x._id, label: x.name })));
      setActivityOptions(a.data.map((x) => ({ value: x._id, label: x.name })));
      setHotelOptions(h.data.map((x) => ({ value: x._id, label: x.name })));
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<AdminTourPackageRaw>(`/packages/${id}`, { raw: true }).
    then((p) => {
      setName(p.name);
      setCategory(p.category);
      setTourType(p.tourType);
      setHeroImage(p.heroImage ? [p.heroImage] : []);
      setGallery(p.gallery || []);
      setDestinations(p.destinations.map((d) => d._id));
      setActivities(p.activities.map((a) => a._id));
      setHotels(p.hotels.map((h) => h._id));
      setDurationDays(p.durationDays);
      setDurationNights(p.durationNights);
      const loadedItinerary =
        p.itinerary.length > 0 ?
        p.itinerary.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          destinations: (day.destinations || []).map((d) => d._id),
          activities: (day.activities || []).map((a) => a._id),
          hotel: day.hotel?._id || '',
          meals: day.meals || []
        })) :
        [emptyDay(1)];
      setItinerary(loadedItinerary);
      initialItinerary.current = serializeItinerary(loadedItinerary);
      setIncludedServices(p.includedServices || []);
      setExcludedServices(p.excludedServices || []);
      setDescription(p.description);
      setHighlights(p.highlights || []);
      setPrice(p.price);
      setDiscountPrice(p.discountPrice ?? '');
      setChildPricePercent(p.childPricePercent ?? 50);
      setMinTravelers(p.minTravelers);
      setMaxTravelers(p.maxTravelers);
      setStatus(p.status);
      setIsFeatured(p.isFeatured);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const updateDay = (index: number, patch: Partial<ItineraryDayForm>) => {
    setItinerary((prev) => prev.map((d, i) => i === index ? { ...d, ...patch } : d));
  };

  const addDay = () => setItinerary((prev) => [...prev, emptyDay(prev.length + 1)]);
  const removeDay = (index: number) => setItinerary((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const normalizedItinerary = itinerary.map(({ hotel, ...day }) => ({
      ...day,
      ...(hotel ? { hotel } : {})
    }));
    const itineraryChanged = !isEdit || serializeItinerary(itinerary) !== initialItinerary.current;
    const payload = {
      name,
      category,
      tourType,
      heroImage: heroImage[0] || '',
      gallery,
      destinations,
      activities,
      hotels,
      durationDays,
      durationNights,
      // Gallery-only edits should not re-submit legacy itinerary data. This
      // prevents an unrelated itinerary cast failure from blocking media
      // updates. A changed itinerary is still sent in full.
      ...(itineraryChanged ? { itinerary: normalizedItinerary } : {}),
      includedServices,
      excludedServices,
      description,
      highlights,
      price,
      discountPrice: discountPrice === '' ? undefined : discountPrice,
      childPricePercent,
      minTravelers,
      maxTravelers,
      status,
      isFeatured
    };
    try {
      if (isEdit) {
        await apiPatch(`/packages/${id}`, payload);
        toast('Package updated.');
      } else {
        await apiPost('/packages', payload);
        toast('Package created.');
      }
      navigate('/admin/packages');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save package.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Package' : 'Add Package'} subtitle="Craft the full journey - itinerary, pricing and media" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Basics</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TranslatedInput label="Package Name" value={name} onChange={setName} required />
            <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))} />
            <SelectField label="Tour Type" value={tourType} onChange={setTourType} options={[{ label: 'Private', value: 'Private' }, { label: 'Group', value: 'Group' }]} />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }]} />
            <NumberField label="Duration (Days)" value={durationDays} onChange={setDurationDays} min={1} required />
            <NumberField label="Duration (Nights)" value={durationNights} onChange={setDurationNights} min={0} required />
          </div>
          <div className="mt-4">
            <TranslatedTextarea label="Description" value={description} onChange={setDescription} required />
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
          <p className="mb-4 font-display text-sm font-semibold text-forest">Linked Content</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <RefMultiSelect label="Destinations" options={destOptions} value={destinations} onChange={setDestinations} />
            <RefMultiSelect label="Activities" options={activityOptions} value={activities} onChange={setActivities} />
            <RefMultiSelect label="Hotels" options={hotelOptions} value={hotels} onChange={setHotels} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <RepeatSection label="Day-by-Day Itinerary" onAdd={addDay} addLabel="Add Day">
            {itinerary.map((day, i) =>
            <div key={i} className="rounded-xl border border-forest/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-forest">Day {day.dayNumber}</p>
                  {itinerary.length > 1 &&
                <button type="button" onClick={() => removeDay(i)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                }
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TranslatedInput label="Title" value={day.title} onChange={(v) => updateDay(i, { title: v })} />
                  <div className="sm:col-span-2">
                    <TranslatedTextarea label="Description" value={day.description} onChange={(v) => updateDay(i, { description: v })} rows={2} />
                  </div>
                  <RefMultiSelect label="Destinations" options={destOptions} value={day.destinations} onChange={(v) => updateDay(i, { destinations: v })} />
                  <RefMultiSelect label="Activities" options={activityOptions} value={day.activities} onChange={(v) => updateDay(i, { activities: v })} />
                  <SelectField label="Hotel" value={day.hotel} onChange={(v) => updateDay(i, { hotel: v })} options={[{ label: 'None', value: '' }, ...hotelOptions]} />
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
                </div>
              </div>
            )}
          </RepeatSection>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Services &amp; Highlights</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TranslatedTagListInput label="Highlights" value={highlights} onChange={setHighlights} />
            <TranslatedTagListInput label="Included Services" value={includedServices} onChange={setIncludedServices} />
            <TranslatedTagListInput label="Excluded Services" value={excludedServices} onChange={setExcludedServices} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Pricing</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField label="Price (USD)" value={price} onChange={setPrice} min={0} required />
            <NumberField label="Discount Price (optional)" value={discountPrice} onChange={setDiscountPrice} min={0} />
            <NumberField label="Child Price (% of adult)" value={childPricePercent} onChange={setChildPricePercent} min={0} />
            <NumberField label="Min Travelers" value={minTravelers} onChange={setMinTravelers} min={1} />
            <NumberField label="Max Travelers" value={maxTravelers} onChange={setMaxTravelers} min={1} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/packages')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>);

}
